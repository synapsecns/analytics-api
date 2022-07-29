import fetch from 'node-fetch';

let indexingInterval = 50 * 1000
let prefixUrl = 'http://localhost:4001/api/v1/analytics'

let urls: Array<string> = [
    '/volume/total/in',
    '/volume/total/out',
    '/volume/total/tx_count/in',
    '/volume/total/tx_count/out',
    '/new_users'
]

async function cacheEndpoints() {
    // Aggregate queries
    let queries = []
    for (let url of urls) {
        queries.push(fetch(`${prefixUrl}${url}`))
    }

    // Start timer
    let startTime = Math.floor(Date.now() / 1000)

    // Concurrently cache
    let resArr = await Promise.all(queries)
    for (let res of resArr) {
        if (res.status !== 200) {
            console.error(res.status, res.url)
        }
    }

    // End timer and log
    let endTime = Math.floor(Date.now() / 1000)

    console.log(`cached endpoints at ${endTime}, taking ${endTime - startTime} seconds`)
}

export default function startCacheWorker() {
    cacheEndpoints().then(() => setInterval(cacheEndpoints, indexingInterval))
}
