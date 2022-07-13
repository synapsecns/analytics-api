import express, {Request, Response} from "express";
import {param, validationResult} from "express-validator";

const router = express.Router();

router.get('/total/tx_count/:direction',
    [
        param('direction').isIn(["in", "out"]),
    ],
    async (req: Request, res: Response) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    return res.json({"data":{"ethereum" : []}})

});

export default router