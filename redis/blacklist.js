const redis = require("redis");

let redisClient;
redisClient = redis.createClient();
//redisClient
redisClient.on("connect", () => console.log("Connected to Redis!"));
redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.connect();

module.exports = redisClient;
