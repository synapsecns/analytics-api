import {Request, Response} from "express"
import {RequestCache} from '../db/RequestCache'
import {getDailyChainTxnCount} from '../queries/dailyTxnCountForChain'
import {getTotalChainTxnCount} from '../queries/totalTxnCountForChain'
import {getDailyTxnCountAllChains} from '../queries/dailyTxnCountAllChains'
import {getChainIdNumFromName, getChainIdNums, getChainNameFromId} from '../utils/chainUtils'

interface VolumeTxnCountResponse {
    [data: string]: {
        [chain: string]: {
            [date: string]: number
        },
        totals: {
            [date: string]: number
        }
    }
}

export async function totalTxnCountController(req: Request, res: Response) {

    // Determine direction and chainIds to find results for
    let direction = req.params.direction
    let forChainIds: number[] = req.query.chain ?
        [getChainIdNumFromName(req.query.chain)] : getChainIdNums()

    let resData: VolumeTxnCountResponse = {data: {totals: {}}}

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

}