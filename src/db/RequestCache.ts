import {Request} from "express";
import hash from 'object-hash'
import {RedisConnection} from './RedisConnection'

/***
 * Get cache key for request
 * @param req
 */
function getRouteCacheKey(req: Request) {
    let path: string = req.path
    let params: object = req.query
    let argsHash: string = hash(params)
    let key: string = `${path}_${argsHash}`
    return key
}

const REDIS_EXPIRE_TTL_DEFAULT = 90

export class RequestCache {

    /**
     * Cache express responses given path and query params in redis
     * @return {Promise<String>}
     * @param req
     * @param jsonRes
     * @param expireIn
     */
    static async setResponse(req: Request, jsonRes: object, expireIn: number = REDIS_EXPIRE_TTL_DEFAULT) {
        let key: string = getRouteCacheKey(req)
        let value: string = JSON.stringify(jsonRes)
        await RedisConnection._client.set(key, value, 'EX', expireIn)
    }

    /**
     * Cache express responses given path and query params in redis
     * @return {Promise<String?>}
     * @param req
     */
    static async getResponse(req: Request) {
        let key: string = getRouteCacheKey(req)
        return RedisConnection._client.get(key)
    }

}