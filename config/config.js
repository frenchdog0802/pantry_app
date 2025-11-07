// safe accessor for environments where `process` may be undefined (e.g. browsers)
const safeEnv = (key) => (typeof process !== 'undefined' && process.env && process.env[key]) ? process.env[key] : undefined;

const config = {
    env: safeEnv('NODE_ENV') || 'development',
    port: safeEnv('PORT') || 3000,
    jwtSecret: safeEnv('JWT_SECRET') || "6fa72e20f64b00b6b8c2abf50fca10f11a9e3b8e3f9e056e8e251ad26b2bca8d7a3ce9f1a1df7ab4c1f7f14b9d6d1c9f5df9e6a3c98e7c1d",
    mongoUri: safeEnv('MONGODB_URI') || safeEnv('MONGO_HOST') || "mongodb+srv://x6815541_db_user:Qn4R71XqNTuyck5b@cluster0.xefsthx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0" ||
        'mongodb://' + (safeEnv('IP') || 'localhost') + ':' +
        (safeEnv('MONGO_PORT') || '27017') +
        '/mernproject',
    googleClientId: safeEnv('GOOGLE_CLIENT_ID') || "641014738117-1ro2oeiciq0be6h1qfjgdvoggp97eiks.apps.googleusercontent.com",
}

if (config.env === 'production' && (!config.jwtSecret || !config.mongoUri)) {
    throw new Error('Missing required env vars in production');
}
export default config;

