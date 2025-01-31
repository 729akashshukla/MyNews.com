import redis from "express-redis-cache";

const redisCache = redis({
    host: "localhost",
    port: 6379,
    expire: 60 * 60 ,
    
});

export default redisCache