// server/config/redis.js
const redis = {
    on: () => { },
    get: async () => null,
    set: async () => null,
    del: async () => null,
    isOpen: true,
    connect: async () => { console.log("Redis "); }
};

export const connectRedis = async () => {
    await redis.connect();
};

export default redis;