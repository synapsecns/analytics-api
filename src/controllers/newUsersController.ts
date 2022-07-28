import {Request, Response} from "express"
import {RequestCache} from '../db/RequestCache'
import {getDailyUniqueUsers} from '../queries/dailyUniqueUsers'

interface NewUsersResponse {
    data: {
        [date: string]: {
            newUsers: number
        }
    }
}

export async function newUsersController(req: Request, res: Response) {

    // Get dates to find result until
    let fromDate = req.query.fromDate ? req.query.fromDate.toString() : undefined
    let toDate = req.query.toDate ? req.query.toDate.toString() : undefined

    let resData: NewUsersResponse = {data: {}}

    // Compute and aggregate result
    let dailyUsersRes = await getDailyUniqueUsers(fromDate, toDate)
    for (const dUsers of dailyUsersRes) {
        let date = dUsers._id
        if (date === null) continue
        resData.data[date] = dUsers.newUserCnt
    }

    await RequestCache.setResponse(req, resData)

    return res.json(resData)

}