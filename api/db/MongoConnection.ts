import { MongoClient } from "mongodb"

export class MongoConnection {
    static _client: MongoClient

    /** Instantiation/creation of mongodb client */
    static async createClient() {
        let MONGO_URI = process.env.MONGO_URI!
        return MongoConnection._client = await MongoClient.connect(
            MONGO_URI,
            {maxPoolSize: 64}
        )
    }
    /** get the underlying mongo client db */
    static async getClientDb() {
        return MongoConnection._client.db()
    }

    static async getBridgeTransactionsCollection() {
        return (await this.getClientDb()).collection('bridgetransactions');
    }
}
