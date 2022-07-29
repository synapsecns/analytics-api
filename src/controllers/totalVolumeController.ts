import {Request, Response} from "express"
import {RequestCache} from '../db/RequestCache'
import {getChainIdNums, getChainNameFromId} from '../utils/chainUtils'
import {DailyVolumeForChainQueryResult, getDailyChainVolume} from '../queries/dailyVolumeForChain'
import {getTotalChainVolume, TotalVolumeForChainQueryResult} from '../queries/totalVolumeForChain'
import {DailyVolumeAllChainsQueryResult, getDailyVolumeAllChains} from '../queries/dailyVolumeAllChains'

interface VolumeTotalResponse {
    data: {
        [date: string]: {
            [chain: string]: number
        },
        totals: {
            [chain: string]: number
        }
    }
}

export async function totalVolumeController(req: Request, res: Response) {

    // Determine direction to find results for
    let direction = req.params.direction

    // Compile queries
    let queries: Array<Promise<any>> = []
    for (const chainId of getChainIdNums()) {
        queries.push(getDailyChainVolume(chainId, direction))
        queries.push(getTotalChainVolume(chainId, direction))
    }
    queries.push(getDailyVolumeAllChains(direction))

    // Process concurrently
    const queryResults: Array<
        DailyVolumeForChainQueryResult |
        DailyVolumeAllChainsQueryResult |
        TotalVolumeForChainQueryResult
    > = await Promise.all(queries)

    // Aggregate data from responses
    let resData: VolumeTotalResponse = {data: {totals: {}}}
    for (let qRes of queryResults) {
        if ('chainId' in qRes && 'dailyVolume' in qRes) {

            // Append daily volume for chain
            let chainName = getChainNameFromId(qRes.chainId)
            for (let dateVolume of qRes.dailyVolume) {
                const date = dateVolume._id
                if (date === null) continue
                resData.data[date] = !(date in resData.data) ? {} : resData.data[date]
                resData.data[date][chainName] = dateVolume.volume
            }
        } else if ('chainId' in qRes && 'totalVolume' in qRes) {

            // Append total volume for chain
            let chainName = getChainNameFromId(qRes.chainId)
            if (qRes.totalVolume.length > 0 && qRes.totalVolume[0].total) {
                resData.data.totals[chainName] = qRes.totalVolume[0].total
            }
        } else if ('dailyVolumes' in qRes) {

            // Append total daily volumes for all chains
            for (const dVolume of qRes.dailyVolumes) {
                let date = dVolume._id
                if (date === null) continue
                resData.data[date] = !(date in resData.data) ? {} : resData.data[date]
                resData.data[date]['total'] = dVolume.total
            }
        }
    }

    await RequestCache.setResponse(req, resData)

    return res.json(resData)

}