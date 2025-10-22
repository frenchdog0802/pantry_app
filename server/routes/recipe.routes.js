import express from "express";
import recipeCtrl from "../controllers/recipe.controller.js";
import { authenticateJWT } from "../controllers/auth.controller.js";
const router = express.Router();

router.get('/', authenticateJWT, recipeCtrl.getAllRecipes);
router.get('/:id', authenticateJWT, recipeCtrl.getRecipeById);
router.post('/', authenticateJWT, recipeCtrl.createRecipe);
router.put('/:id', authenticateJWT, recipeCtrl.updateRecipe);
router.delete('/:id', authenticateJWT, recipeCtrl.deleteRecipe);

export default router;