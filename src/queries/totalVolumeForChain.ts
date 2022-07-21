import {MongoConnection} from '../db/MongoConnection'
import {QueryArgs} from '../db/queryAndCache'

export async function getTotalChainVolume(args: QueryArgs) {
    let chainId: number = args.chainId
    let direction: string = args.direction

    let collection = await MongoConnection.getBridgeTransactionsCollection()

    // Determine fields to be used, depending on transaction direction
    let matchFilter = direction === 'out' ? {'fromChainId': chainId} : {'toChainId': chainId}
    let valueField = direction === 'out' ? '$sentValueUSD' : '$receivedValueUSD'

    return await collection.aggregate([
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
}