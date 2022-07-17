import express, {Request, Response} from "express";
import {param, validationResult} from "express-validator";
import {MongoConnection} from '../../db/MongoConnection'
import {Document} from 'mongodb'
import {getChains} from '../../utils/chainUtils'

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

        let supportedChainIds = getChains()
        let direction = req.params.direction;

        let chainIds: string[]
        if (req.query.chainId && (<string>req.query.chainId in supportedChainIds)) {
            chainIds = [<string>req.query.chainId]
        } else {
            chainIds = Object.keys(getChains());
        }

        let resObj = {
            "data": {}
        }

        let collection = await MongoConnection.getBridgeTransactionsCollection()
        for (const id of chainIds) {
            let matchFilter = direction === 'in' ?
                {'fromChainId': id, 'sentTime': {$exists: true}} :
                {'toChainId': id, 'receivedTime': {$exists: true}}
            let dateField = direction === 'in' ? '$sentTime' : '$receivedTime'

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

            console.log(txnCountByDate)

            // Maps date to count
            for (let txn of txnCountByDate) {
                // @ts-ignore
                resObj.data[id][txn._id] = txn.count
            }
        }

        return res.json(resObj)

    });

export default router