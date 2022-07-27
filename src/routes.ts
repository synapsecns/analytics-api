import express from "express";
import {param, query} from 'express-validator'
import {getChainNames} from './utils/chainUtils'
import {returnIfCached} from './middleware/returnIfCached'
import {validationCheck} from './middleware/validationCheck'
import {totalVolumeController} from './controllers/totalVolumeController'
import {totalTxnCountController} from './controllers/totalTxnCountController'
import {newUsersController} from './controllers/newUsersController'

let defaultMiddleware = [
    validationCheck,
    returnIfCached
]

const router = express.Router();

router.get('/volume/total/:direction',
    [
        param('direction').isIn(["in", "out"])
    ],
    ...defaultMiddleware,
    totalVolumeController
)

router.get('/volume/total/tx_count/:direction',
    [
        param('direction').isIn(["in", "out"]),
        query('chain').optional().isIn(getChainNames())
    ],
    ...defaultMiddleware,
    totalTxnCountController
)

router.get('/new_users',
    [
        param('fromDate').optional().isDate(),
        param('toDate').optional().isDate()
    ],
    ...defaultMiddleware,
    newUsersController
)

export default router
