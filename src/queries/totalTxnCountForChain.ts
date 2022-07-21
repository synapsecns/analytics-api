import {MongoConnection} from '../db/MongoConnection'
import {QueryArgs} from '../db/queryAndCache'

export async function getTotalChainTxnCount(args: QueryArgs) {
    let chainId: number = args.chainId
    let direction: string = args.direction

    let collection = await MongoConnection.getBridgeTransactionsCollection()

    let matchFilter = direction === 'out' ? {'fromChainId': chainId} : {'toChainId': chainId}

    return await collection.aggregate([
        {
            $match: matchFilter
        },
        {
            $group: {
                _id: null,
                total: {$sum: 1},
            }
        },
        {
            $project: {
                total: 1,
            }
        }
    ]).toArray()
}