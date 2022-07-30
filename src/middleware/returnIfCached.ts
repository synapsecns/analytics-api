import {Request, Response} from "express"
import {RequestCache} from '../db/RequestCache'

export async function returnIfCached(req: Request, res: Response, next: Function) {
    if (req.get('CACHE_BYPASS_KEY') === process.env.CACHE_BYPASS_KEY) {
        next()
    } else {
        let cachedResponse = await RequestCache.getResponse(req)
        if (cachedResponse) {
            let parsedResponse = JSON.parse(cachedResponse)
            return res.json(parsedResponse)
        }
        next()
    }
}