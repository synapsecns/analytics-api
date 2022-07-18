import 'dotenv/config'

import express, { Express, Request, Response } from 'express';
import bodyParser from "body-parser";

import {MongoConnection} from "./db/MongoConnection";
import {RedisConnection} from "./db/RedisConnection";

// Import routes
import volume from "./routes/volume";

async function setupDBs() {
    await MongoConnection.createClient()
    await RedisConnection.createClient()
}

setupDBs().then(_ => {

    // Setup API
    const app: Express = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.set('json spaces', 4)

    app.get('/', (req: Request, res: Response) => {
        res.json({"message":"synapse analytics api"});
    });

    // Setup routes
    app.use('/api/v1/volume', volume);

    // Start server
    const port = process.env.PORT || 4001;
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
})
