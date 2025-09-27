import express from "express";
import recipeCtrl from "../controllers/recipe.controller.js";

const router = express.Router();

router.get('/', recipeCtrl.getAllRecipes);
router.get('/:id', recipeCtrl.getRecipeById);
router.post('/', recipeCtrl.createRecipe);
router.put('/:id', recipeCtrl.updateRecipe);
router.delete('/:id', recipeCtrl.deleteRecipe);

export default router;