// safe accessor for environments where `process` may be undefined (e.g. browsers)
import dotenv from 'dotenv';
dotenv.config();

const safeEnv = (key) => (typeof process !== 'undefined' && process.env && process.env[key]) ? process.env[key] : undefined;


const config = {
    env: safeEnv('NODE_ENV') || 'development',
    port: safeEnv('PORT') || 3000,
    jwtSecret: safeEnv('JWT_SECRET') || "6fa72e20f64b00b6b8c2abf50fca10f11a9e3b8e3f9e056e8e251ad26b2bca8d7a3ce9f1a1df7ab4c1f7f14b9d6d1c9f5df9e6a3c98e7c1d",
    mongoUri: safeEnv('MONGODB_URI') || "mongodb+srv://x6815541_db_user:Qn4R71XqNTuyck5b@cluster0.xefsthx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    cloudinarycloudName: safeEnv('CLOUDINARY_CLOUD_NAME') || 'ddtjd5tbg',
    cloudinaryApiKey: safeEnv('CLOUDINARY_API_KEY') || '862352563776518',
    cloudinaryApiSecret: safeEnv('CLOUDINARY_API_SECRET') || 'cqdZDMRF_kUoPkVKnmPUe08hYCk',
    openAIApiKey: safeEnv('OPENAI_API_KEY') || '',
    redisUrl: safeEnv('REDIS_URL') || 'redis://default:Vk6uzJqcIDSDjYP6uZlgDuQQ1hDXWo0H@redis-19969.c62.us-east-1-4.ec2.cloud.redislabs.com:19969',
    stripeSecretKey: safeEnv('STRIPE_SECRET_KEY'),
    stripeWebhookSecret: safeEnv('STRIPE_WEBHOOK_SECRET'),
    // Auth0 configuration for mobile SSO
    auth0Domain: safeEnv('AUTH0_DOMAIN') || 'dev-r1tfs3j17m7ipwcs.us.auth0.com',
}

if (config.env === 'production' && (!config.jwtSecret || !config.mongoUri)) {
    throw new Error('Missing required env vars in production');
}
export default config;

