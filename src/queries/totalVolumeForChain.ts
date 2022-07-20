import {MongoConnection} from '../db/MongoConnection'

export async function getTotalChainVolume(chainId: number, direction: string) {
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