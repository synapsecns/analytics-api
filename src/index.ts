import 'dotenv/config'

import express, { Express, Request, Response } from 'express'
import bodyParser from "body-parser"
import ejs from 'ejs'
import cors from 'cors';

import {MongoConnection} from "./db/MongoConnection"
import {RedisConnection} from "./db/RedisConnection"
import startCacheWorker from "./workers/cacheWorker"

import routes from "./routes"

export const dbConnect = async() => {
    await MongoConnection.createClient()
    await RedisConnection.createClient()
}

export const createServer = async (port: number = 4001) => {

    // Setup Express API
    const app: Express = express()
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(cors())

    // Configure OpenAPI view
    app.set('json spaces', 4)
    app.set('view engine', 'html');
    app.engine('html', ejs.renderFile);
    app.use(express.static('views'))

    app.get('/', (req: Request, res: Response) => {
        res.render('index.html');
    });

    // Setup routes
    app.use('/api/v1/analytics', routes)

    // Start server
    const server = await app.listen(port)
    console.log(`Server is running at http://localhost:${port}`)

    return server
}

// Start server if not triggered by tests
if (!process.env.TEST) {
    dbConnect().then(_ => createServer().then(() => startCacheWorker()))
}
