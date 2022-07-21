import {MongoConnection} from '../db/MongoConnection'
import {QueryArgs} from '../db/queryAndCache'

export async function getDailyChainTxnCount(args: QueryArgs) {
    const chainId: number = args.chainId
    const direction: string = args.direction

    let collection = await MongoConnection.getBridgeTransactionsCollection()

    // Determine fields to be used, depending on transaction direction
    let matchFilter = direction === 'out' ? {'fromChainId': chainId} : {'toChainId': chainId}
    let dateField = direction === 'out' ? '$sentTime' : '$receivedTime'

    return await collection.aggregate([
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
                count: {$sum: 1},
            }
        },
        {
            $project: {
                _id: 1,
                count: {$toInt: '$count'},
            }
        },
        {
            $sort: {
                _id: -1
            }
        }
    ]).toArray()
}