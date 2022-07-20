import {MongoConnection} from '../db/MongoConnection'

export async function getDailyVolumeAllChains(direction: string) {
    let collection = await MongoConnection.getBridgeTransactionsCollection()

    // Determine fields to be used, depending on transaction direction
    let dateField = direction === 'out' ? '$sentTime' : '$receivedTime'
    let valueField = direction === 'out' ? '$sentValueUSD' : '$receivedValueUSD'

    return await collection.aggregate([
        {
            // Multiple epoch by 1000 as $toDate in mongo requires ms
            $addFields: {
                date: {
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
                _id: "$date",
                total: {$sum: valueField},
            }
        },
        {
            $project: {
                _id: 1,
                total: 1,
            }
        }
    ]).toArray()
}