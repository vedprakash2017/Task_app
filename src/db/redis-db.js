const redis = require('redis')
const url = process.env.redisUrl

const redisClient = redis.createClient( {
    url
})

redisClient.connect().then((err)=>{
    if(err)
        console.log('Error!')
    console.log('Connected to redis!')
    // redisClient.flushAll()
})

redisClient.on('error', (err)=>{
    console.log('error',err)
})

module.exports =  redisClient 