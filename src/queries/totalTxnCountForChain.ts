import {MongoConnection} from '../db/MongoConnection'

export async function getTotalChainTxnCount(chainId: number, direction: string) {
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