import express, {Request, Response} from "express";
import {param, validationResult, query} from "express-validator";
import {getDailyChainTxnCount} from '../queries/dailyTxnCountForChain'
import {getTotalChainTxnCount} from '../queries/totalTxnCountForChain'
import {getDailyChainVolume} from '../queries/dailyVolumeForChain'
import {getTotalChainVolume} from '../queries/totalVolumeForChain'
import {getDailyTxnCountAllChains} from "../queries/dailyTxnCountAllChains"
import {getDailyVolumeAllChains} from "../queries/dailyVolumeAllChains"
import {RequestCache} from '../db/RequestCache'

import {
    getChainIdNumFromName,
    getChainIdNums,
    getChainNameFromId,
    getChainNames
} from '../utils/chainUtils'

const volumeRoutes = express.Router();

volumeRoutes.get('/total/tx_count/:direction',
    [
        param('direction').isIn(["in", "out"]),
        query('chain').optional().isIn(getChainNames())
    ],
    async (req: Request, res: Response) => {

        let cachedResponse = await RequestCache.getResponse(req)
        if (cachedResponse) {
            let parsedResponse = JSON.parse(cachedResponse)
            return res.json(parsedResponse)
        }

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        // Determine direction and chainIds to find results for
        let direction = req.params.direction
        let forChainIds: number[] = req.query.chain ?
            [getChainIdNumFromName(req.query.chain)] : getChainIdNums()

        let resData: {
            [data: string]: {
                [chain: string]: {
                    [date: string]: number
                },
                totals: {
                    [date: string]: number
                }
            }
        } = {data: {totals: {}}}

        for (const chainId of forChainIds) {
            let chainName = getChainNameFromId(chainId)

            // get daily txn count for chain
            let chainTxnCountRes = await getDailyChainTxnCount(chainId, direction)
            resData.data[chainName] = {}
            for (let dailyTxnCount of chainTxnCountRes) {
                let date = dailyTxnCount._id
                if (date === null) continue
                resData.data[chainName][date] = dailyTxnCount.count
            }

            // get total txn count for chain
            let totalChainTxnCount = await getTotalChainTxnCount(chainId, direction)
            if (totalChainTxnCount.length > 0 && totalChainTxnCount[0].total) {
                resData.data[chainName]['total'] = totalChainTxnCount[0].total
            }

        }

        // get daily totals across all chains
        let dailyCounts = await getDailyTxnCountAllChains(direction)
        resData.data['totals'] = {}
        for (const dCount of dailyCounts) {
            let date = dCount._id
            if (date === null) continue
            resData.data['totals'][date] = dCount.total
        }

        await RequestCache.setResponse(req, resData)

        return res.json(resData)
    });

volumeRoutes.get('/total/:direction',
    [
        param('direction').isIn(["in", "out"]),
    ],
    async (req: Request, res: Response) => {

        let cachedResponse = await RequestCache.getResponse(req)
        if (cachedResponse) {
            let parsedResponse = JSON.parse(cachedResponse)
            return res.json(parsedResponse)
        }

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        // Determine direction and chainIds to find results for
        let direction = req.params.direction

        let resData: {
            data: {
                [date: string]: {
                    [chain: string]: number
                },
                totals: {
                    [chain: string]: number
                }
            }
        } = {data: {totals: {}}}

        for (const chainId of getChainIdNums()) {
            let chainName = getChainNameFromId(chainId)
            let chainVolume = await getDailyChainVolume(chainId, direction)

            // Append daily volume for chain
            for (let dateVolume of chainVolume) {
                const date = dateVolume._id
                if (date === null) continue
                resData.data[date] = !(date in resData.data) ? {} : resData.data[date]
                resData.data[date][chainName] = dateVolume.volume
            }

            // Append total volume
            let totalTxnVolumeRes = await getTotalChainVolume(chainId, direction)
            if (totalTxnVolumeRes.length > 0 && totalTxnVolumeRes[0].total) {
                resData.data.totals[chainName] = totalTxnVolumeRes[0].total
            }
        }

        // Get daily total volume across all chains
        let dailyVolumes = await getDailyVolumeAllChains(direction)
        for (const dVolume of dailyVolumes) {
            let date = dVolume._id
            if (date === null) continue
            resData.data[date] = !(date in resData.data) ? {} : resData.data[date]
            resData.data[date]['total'] = dVolume.total
        }

        await RequestCache.setResponse(req, resData)

        return res.json(resData)
    });

export default volumeRoutes