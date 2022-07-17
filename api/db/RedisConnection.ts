import Redis from "ioredis";
import hash from "object-hash"

export class RedisConnection {
    static _client: Redis

    /** Instantiation/creation of redis client */
    static async createClient() {
        let REDIS_URI = process.env.REDIS_URI!
        return RedisConnection._client = new Redis(REDIS_URI)
    }
    /** get the underlying redis client db */
    static async getClient() {
        return RedisConnection._client
    }

    /**
     * Cache mongo results for given graphql query with `queryName` and `args` in redis
     * @param queryName
     * @param args
     * @param mongoResults
     * @param expireIn
     * @return {Promise<String>}
     */
    static async setForQuery(queryName: String, args: Object, mongoResults: Object, expireIn: Number) {
        let argsHash = hash(args)
        let key: string = `${queryName}_${argsHash}`
        let jsonRes: string = JSON.stringify(mongoResults)

        // @ts-ignore
        await RedisConnection._client.set(key, jsonRes, 'EX', expireIn)
    }

    /**
     * Get mongo results for given graphql query with `queryName` and `args` in redis
     * @param queryName
     * @param args
     * @return {Promise<String>}
     */
    static async getForQuery(queryName: String, args: Object){
        let argsHash = hash(args)
        let key = `${queryName}_${argsHash}`
        return RedisConnection._client.get(key)
    }
}
