import {MongoConnection} from '../db/MongoConnection'
import {dateToUnixTimestamp} from "../utils/timeUtils"

export async function getDailyUniqueUsers(fromDate?: string, toDate?: string) {
    let collection = await MongoConnection.getBridgeTransactionsCollection()

    // TODO: Fix matchfilter
    let matchFilter: {'$sentTime'?: any, '$receivedTime'?: any} = {}
    // if (fromDate) {
    //     let fromTimestamp = dateToUnixTimestamp(fromDate);
    //     matchFilter['$sentTime'] = {"$gt": fromTimestamp}
    // }
    // if (toDate) {
    //     let toTimestamp = dateToUnixTimestamp(toDate);
    //     matchFilter['$receivedTime'] = {"$lt": toTimestamp}
    // }

    return await collection.aggregate([
        {
            $match: matchFilter
        },
        {
            $sort: {
                sentTime: 1
            }
        },
        {
            $addFields: {
                date: {
                    $dateToString: {
                        format: '%Y-%m-%d', date: {
                            $toDate: {$multiply: ['$sentTime', 1000]}
                        }
                    }
                }
            }
        },
        {
            $match: matchFilter
        },
        // Group addresses with their first txn date
        {
            $group: {
                _id: "$fromAddress",
                firstTxnDate: { $first: "$date" }
            }
        },
        // Group number of txns for a date, under tht date
        {
            $group: {
                _id: "$firstTxnDate",
                newUserCnt: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 1,
                newUserCnt: 1
            }
        },
        {
            $sort: {
                _id: -1
            }
        }
    ]).toArray()
}