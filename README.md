# synapse-analytics-api

Derives analytics presented as REST API endpoints from data populated by [synapse-indexer](https://github.com/synapsecns/synapse-indexer) 

### Local Setup

* `cp .env.sample .env`
  * Ensure `MONGO_URI` and `REDIS_URI` is set, with mongo being the same instance as synapse-indexer 
* `npm i`
* `npm run dev`