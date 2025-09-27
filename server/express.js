import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compress from "compression";
import cors from "cors";
import helmet from "helmet";
import userRoutes from "./routes/user.routes.js";
import newsRoutes from "./routes/news.routes.js";
import authRoutes from "./routes/auth.routes.js";
import historyRoutes from "./routes/history.route.js";
import path from "path";
import recipeRoutes from "./routes/recipe.routes.js";



const app = express();
const CURRENT_WORKING_DIR = process.cwd();
app.use(cors({
  origin: 'http://localhost:5173',  // Allow frontend to access from this domain
}));
app.use(express.static(path.join(CURRENT_WORKING_DIR, "dist/app")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/recipes", recipeRoutes);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compress());
app.use(helmet());
app.use(cors());
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: err.name + ": " + err.message });
  } else if (err) {
    res.status(400).json({ error: err.name + ": " + err.message });
    console.log(err);
  }
});

export default app;
