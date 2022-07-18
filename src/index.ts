import 'dotenv/config'

import express, { Express, Request, Response } from 'express';
import bodyParser from "body-parser";

import {MongoConnection} from "./db/MongoConnection";
import {RedisConnection} from "./db/RedisConnection";

// Import routes
import volume from "./routes/volume";

export const dbConnect = async() => {
    await MongoConnection.createClient()
    await RedisConnection.createClient()
}

export const createServer = async (port: number = 4001) => {
    // Setup Express API
    const app: Express = express()
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.set('json spaces', 4)

    app.get('/', (req: Request, res: Response) => {
        res.json({"message":"synapse analytics api"})
    });

    // Setup routes
    app.use('/api/v1/analytics/volume', volume)

    // Start server
    const server = await app.listen(port)
    console.log(`Server is running at http://localhost:${port}`)

    return server
}

// Start server if not triggered by tests
if (!process.env.TEST) {
    dbConnect().then(_ => createServer())
}
