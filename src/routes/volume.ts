import express, {Request, Response} from "express";
import {param, validationResult, query} from "express-validator";
import {getChainTxnCount} from '../queries/chainTxnCount'
import {
    getChainIdNumFromName,
    getChainIdNums,
    getChainNameFromId,
    getChainNames
} from '../utils/chainUtils'

const router = express.Router();

router.get('/total/tx_count/:direction',
    [
        param('direction').isIn(["in", "out"]),
        query('chain').optional().isIn(getChainNames())
    ],
    async (req: Request, res: Response) => {

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        // Determine direction and chainIds to find results for
        let direction = req.params.direction
        let forChainIds: number[] = req.query.chain ?
            [getChainIdNumFromName(req.query.chain)] : getChainIdNums()

        let resData: {
            [data: string]: {
                [chain: string]: {
                    [date: string]: number
                }
            }
        } = {data: {}}

        // Build result for each chain
        for (const chainId of forChainIds) {
            let chainName = getChainNameFromId(chainId)
            let chainTxnCountRes = await getChainTxnCount(chainId, direction)
            resData.data[chainName] = {}
            for (let txn of chainTxnCountRes) {
                resData.data[chainName][txn._id] = txn.count
            }
        }

        return res.json(resData)

    });

export default router