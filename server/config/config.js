// safe accessor for environments where `process` may be undefined (e.g. browsers)
import dotenv from 'dotenv';
dotenv.config();

const safeEnv = (key) => (typeof process !== 'undefined' && process.env && process.env[key]) ? process.env[key] : undefined;


const config = {
    env: safeEnv('NODE_ENV') || '',
    port: safeEnv('PORT') || '3000',
    jwtSecret: safeEnv('JWT_SECRET') || "",
    mongoUri: safeEnv('MONGODB_URI') || "",
    cloudinarycloudName: safeEnv('CLOUDINARY_CLOUD_NAME') || '',
    cloudinaryApiKey: safeEnv('CLOUDINARY_API_KEY') || '',
    cloudinaryApiSecret: safeEnv('CLOUDINARY_API_SECRET') || '',
    openAIApiKey: safeEnv('OPENAI_API_KEY') || '',
    redisUrl: safeEnv('REDIS_URL') || '',
    stripeSecretKey: safeEnv('STRIPE_SECRET_KEY'),
    stripeWebhookSecret: safeEnv('STRIPE_WEBHOOK_SECRET'),
    // Auth0 configuration for mobile SSO
    auth0Domain: safeEnv('AUTH0_DOMAIN') || '',
}

if (config.env === 'production' && (!config.jwtSecret || !config.mongoUri)) {
    throw new Error('Missing required env vars in production');
}
export default config;

