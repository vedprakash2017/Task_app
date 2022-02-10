const redis = require("redis");
const url = process.env.redisUrl;

let redisClient;
if (process.env.check)
  redisClient = redis.createClient({
    url,
  });
else redisClient = redis.createClient();

const connect = async () => {
  await redisClient.connect();
  console.log("connected to redis!");
};
redisClient.on("error", (err) => {
  console.log("error", err);
});

if (process.env.check) connect();

module.exports = redisClient;
