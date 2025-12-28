import redis from "../config/redis.js";


// define redis key
const REDIS_KEYS = {
    PANTRY_ITEMS: (userId) => `pantryItems:${userId}`,
};

/**
 * Get cached JSON value
 */
const getCache = async (key) => {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
};

/**
 * Set cached JSON value
 */
const setCache = async (key, value, ttl = 300) => {
    await redis.set(key, JSON.stringify(value), {
        EX: ttl
    });
};

/**
 * Delete cache
 */
const deleteCache = async (key) => {
    await redis.del(key);
};

/**
 * Cache-aside helper
 */
const getOrSetCache = async (key, fetchFn, ttl = 300) => {
    const cached = await getCache(key);
    if (cached) return cached;

    const freshData = await fetchFn();
    await setCache(key, freshData, ttl);
    return freshData;
};

export default {
    getCache,
    setCache,
    deleteCache,
    getOrSetCache,
    REDIS_KEYS
};
