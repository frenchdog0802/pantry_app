const userQuota = new Map();

export function quotaLimiter(req, res, next) {
    const userId = req.headers["x-user-id"] || "guest";
    const today = new Date().toISOString().slice(0, 10);

    const key = `${userId}:${today}`;
    const used = userQuota.get(key) || 0;

    if (used >= 5) {
        return res.status(429).json({
            message: "Free plan limit reached (5 messages/day)"
        });
    }

    userQuota.set(key, used + 1);
    next();
}
