import {MongoConnection} from '../db/MongoConnection'
import {QueryArgs} from '../db/queryAndCache'

export async function getDailyTxnCountAllChains(args: QueryArgs) {
    const direction: string = args.direction
    let collection = await MongoConnection.getBridgeTransactionsCollection()

    // Determine fields to be used, depending on transaction direction
    let dateField = direction === 'out' ? '$sentTime' : '$receivedTime'

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
                total: {$sum: 1},
            }
        },
        {
            $project: {
                _id: 1,
                total: 1,
            }
        },
        {
            $sort: {
                _id: -1
            }
        }
    ]).toArray()
}