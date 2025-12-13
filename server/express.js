import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compress from "compression";
import cors from "cors";
import helmet from "helmet";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import path from "path";
import recipeRoutes from "./routes/recipe.routes.js";
import folderRoutes from "./routes/folder.routet.js";
import ingredientRoute from "./routes/ingredient.route.js";
import pantryItemRoute from "./routes/pantryItem.route.js";
import shoppingListRoute from "./routes/shoppingList.route.js";
import mealPlanRoute from "./routes/mealPlan.route.js";
import uploadRoute from "./routes/upload.route.js";

const app = express();

const CURRENT_WORKING_DIR = process.cwd();
app.use(cors({
  origin: 'http://localhost:5173',  // Allow frontend to access from this domain
}));
app.use(express.static(path.join(CURRENT_WORKING_DIR, "client/dist/app")));//for test environment 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recipe", recipeRoutes);
app.use("/api/folder", folderRoutes);
app.use("/api/ingredient", ingredientRoute);
app.use("/api/pantry-item", pantryItemRoute);
app.use("/api/shopping-list", shoppingListRoute);
app.use("/api/meal-plan", mealPlanRoute);
app.use("/api/upload", uploadRoute);
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
    res.json({ error: err.name + ": " + err.message });
    console.log(err);
  }
});

export default app;
