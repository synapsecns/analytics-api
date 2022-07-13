import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response } from 'express';
import bodyParser from "body-parser";
import volume from "./api/v1/routes/volume";

// Setup app
const app: Express = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
    res.json({"message":"synapse analytics api"});
});

// Define routes
app.use('/api/v1/volume', volume);

// Start server
const port = process.env.PORT || 4001;
app.listen(port, () => {
    console.log(`Server is running at https://localhost:${port}`);
});
