// server/config/redis.js
import { createClient } from "redis";
import config from "../config/config.js";

const redis = createClient({
    url: config.redisUrl,
    socket: {
        tls: false,
    }
});

redis.on("connect", () => {
    console.log("Redis connected");
});

redis.on("error", (err) => {
    console.error("Redis error", err);
});

export const connectRedis = async () => {
    if (!redis.isOpen) {
        await redis.connect();
    }
};

export default redis;
