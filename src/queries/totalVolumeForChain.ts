import {MongoConnection} from '../db/MongoConnection'
import {Document} from 'mongodb'

export interface TotalVolumeForChainQueryResult {
    chainId: number
    totalVolume: Document[]
}

export async function getTotalChainVolume(chainId: number, direction: string) {
    let collection = await MongoConnection.getBridgeTransactionsCollection()

    // Determine fields to be used, depending on transaction direction
    let matchFilter = direction === 'out' ? {'fromChainId': chainId} : {'toChainId': chainId}
    let valueField = direction === 'out' ? '$sentValueUSD' : '$receivedValueUSD'

    let queryResult = await collection.aggregate([
        {
            $match: matchFilter
        },
        {
            $group: {
                _id: null,
                total: {$sum: valueField},
            }
        },
        {
            $project: {
                _id: 0,
                total: { $toDouble: "$total" },
            }
        }
    ]).toArray()

    let response:TotalVolumeForChainQueryResult = {chainId, totalVolume: queryResult}
    return response
}