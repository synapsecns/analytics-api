import {MongoConnection} from '../db/MongoConnection'
import {Document} from 'mongodb'

export interface DailyVolumeForChainQueryResult {
    chainId: number
    dailyVolume: Document[]
}

export async function getDailyChainVolume(chainId: number, direction: string) {
    let collection = await MongoConnection.getBridgeTransactionsCollection()

    // Determine fields to be used, depending on transaction direction
    let matchFilter = direction === 'out' ? {'fromChainId': chainId} : {'toChainId': chainId}
    let dateField = direction === 'out' ? '$sentTime' : '$receivedTime'
    let valueField = direction === 'out' ? '$sentValueUSD' : '$receivedValueUSD'

    let queryResult =  await collection.aggregate([
        {
            $match: matchFilter
        },
        {
            // Multiple epoch by 1000 as $toDate in mongo requires ms
            $addFields: {
                'date': {
                    $dateToString: {
                        format: '%Y-%m-%d', date: {
                            $toDate: {$multiply: [dateField, 1000]}
                        }
                    }
                }
            }
        },
        {
            $group: {
                _id: '$date',
                volume: {$sum: valueField},
            }
        },
        {
            $project: {
                _id: 1,
                volume: { $toDouble: "$volume" },
            }
        },
        {
            $sort: {
                _id: -1
            }
        }
    ]).toArray()

    let response: DailyVolumeForChainQueryResult = {chainId, dailyVolume: queryResult}
    return response
}