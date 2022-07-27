import {Request, Response} from "express"
import {RequestCache} from '../db/RequestCache'

export async function returnIfCached(req: Request, res: Response, next: Function) {
    let cachedResponse = await RequestCache.getResponse(req)
    if (cachedResponse) {
        let parsedResponse = JSON.parse(cachedResponse)
        return res.json(parsedResponse)
    }
    next()
}