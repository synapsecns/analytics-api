import {MongoConnection} from '../db/MongoConnection'

export async function getChainTxnCount(chainId: number, direction: string) {
    let collection = await MongoConnection.getBridgeTransactionsCollection()

    // Determine fields to be used, depending on transaction direction
    let matchFilter = direction === 'out' ?
        {'fromChainId': chainId, 'sentTime': {$exists: true}} :
        {'toChainId': chainId, 'receivedTime': {$exists: true}}
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