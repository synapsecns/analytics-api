# synapse-analytics-api

[![codecov](https://codecov.io/gh/synapsecns/synapse-analytics-api/branch/master/graph/badge.svg?token=IGPQKWB9ON)](https://codecov.io/gh/synapsecns/synapse-analytics-api)

Synapse Analytics REST API computed from data populated by [synapse-indexer](https://github.com/synapsecns/synapse-indexer) 

### Endpoints
* View API docs at [https://syn-analytics-api.metagabbar.xyz](https://syn-analytics-api.metagabbar.xyz)
* Routes currently supported: [src/routes.ts](https://github.com/synapsecns/analytics-api/blob/master/src/routes.ts)

### Local Setup

* `cp .env.sample .env`
  * Ensure `MONGO_URI` and `REDIS_URI` is set, with mongo being the same instance as synapse-indexer 
  * Local instances can be setup using docker as 
    * `docker run -d -p 27017:27017 mongo`
    * `docker run -d -p 6379:6379 redis`
* `npm i`
* Run in dev
  * `npm run dev`
* Run in prod
  * `npm run build`
  * `npm start`
* Tests
  * `cp .env.sample .env.test`
  * `echo $'\nTEST=true' >> .env.test`
  * `npm test` or `npm run test:coverage`