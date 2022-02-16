import * as redis from "redis";
const url = process.env.redisUrl;
let redisClient:any;
if (process.env.check)
  redisClient = redis.createClient({
    url,
  });
else redisClient = redis.createClient();

const connect = async () => {

  await redisClient.connect();
  console.log("connected to redis!");
};
redisClient.on("error", (err:String) => {
  console.log("error", err);
});

if (process.env.check) connect();

export default redisClient;
