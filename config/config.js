const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || "6fa72e20f64b00b6b8c2abf50fca10f11a9e3b8e3f9e056e8e251ad26b2bca8d7a3ce9f1a1df7ab4c1f7f14b9d6d1c9f5df9e6a3c98e7c1d",
    mongoUri: process.env.MONGODB_URI || "mongodb+srv://x6815541_db_user:Qn4R71XqNTuyck5b@cluster0.xefsthx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0" ||
        process.env.MONGO_HOST ||
        'mongodb://' + (process.env.IP || 'localhost') + ':' +
        (process.env.MONGO_PORT || '27017') +
        '/mernproject',
    googleClientId: process.env.GOOGLE_CLIENT_ID || "641014738117-1ro2oeiciq0be6h1qfjgdvoggp97eiks.apps.googleusercontent.com",

}
export default config

