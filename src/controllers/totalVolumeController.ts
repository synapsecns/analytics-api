import {Request, Response} from "express"
import {RequestCache} from '../db/RequestCache'
import {getChainIdNums, getChainNameFromId} from '../utils/chainUtils'
import {getDailyChainVolume} from '../queries/dailyVolumeForChain'
import {getTotalChainVolume} from '../queries/totalVolumeForChain'
import {getDailyVolumeAllChains} from '../queries/dailyVolumeAllChains'

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

    let resData: VolumeTotalResponse = {data: {totals: {}}}

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

}