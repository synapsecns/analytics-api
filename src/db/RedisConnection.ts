import Redis from "ioredis";

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
}
