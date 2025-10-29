import config from "./config/config.js";
import app from "./server/express.js";
import mongoose from "mongoose";
import express from "express";
mongoose.Promise = global.Promise;
mongoose
  .connect(config.mongoUri, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  });
mongoose.connection.on("error", () => {
  throw new Error(`unable to connect to database: ${config.mongoUri}`);
});
const CURRENT_WORKING_DIR = process.cwd();



// Optional: Keep a health check route if needed (won't conflict with catch-all if prefixed)
app.get("/api/health", (req, res) => {
  res.json({ message: "Welcome to User application. Server healthy." });
});

app.listen(config.port, (err) => {
  if (err) {
    console.error("Server startup error:", err);
    process.exit(1);
  }
  console.info("Server started on port %s.", config.port);
});