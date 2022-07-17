import express, {Request, Response} from "express";
import {param, validationResult} from "express-validator";
import {MongoConnection} from '../../db/MongoConnection'
import {Document} from 'mongodb'
import {getChainIdNums, getChainNameFromId} from '../../utils/chainUtils'

const router = express.Router();

router.get('/total/tx_count/:direction',
    [
        param('direction').isIn(["in", "out"]),
    ],
    async (req: Request, res: Response) => {

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        let supportedChainIds = getChainIdNums()
        let direction = req.params.direction;

        let resObj = {
            "data": {}
        }

        let collection = await MongoConnection.getBridgeTransactionsCollection()
        for (const chainId of supportedChainIds) {

            let matchFilter = direction === 'out' ?
                {'fromChainId': chainId, 'sentTime': {$exists: true}} :
                {'toChainId': chainId, 'receivedTime': {$exists: true}}
            let dateField = direction === 'out' ? '$sentTime' : '$receivedTime'

            let txnCountByDate: Document[] = await collection.aggregate([
                {
                    $match: matchFilter
                },
                {
                    $addFields: {
                        'date': {
                            $dateToString: {
                                format: "%Y-%m-%d", date: {
                                    $toDate: {$multiply: [dateField, 1000]}
                                }
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: "$date",
                        count: {$sum: 1},
                    }
                },
                {
                    $project: {
                        _id: 1,
                        count: {$toInt: "$count"},
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                }
            ]).toArray()

            // Maps date to count
            let chainName = getChainNameFromId(chainId)
            // @ts-ignore
            resObj['data'][chainName] = {}
            for (let txn of txnCountByDate) {
                // @ts-ignore
                resObj['data'][chainName][txn._id] = txn.count
            }
        }

        return res.json(resObj)

    });

export default router