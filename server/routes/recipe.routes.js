import express from "express";
import recipeCtrl from "../services/recipe.service.js";
import auth from "../services/auth.service.js";
const router = express.Router();

router.get('/', auth.requireSignin, recipeCtrl.getAllRecipes);
router.get('/:id', auth.requireSignin, recipeCtrl.getRecipeById);
router.post('/', auth.requireSignin, recipeCtrl.createRecipe);
router.put('/:id', auth.requireSignin, recipeCtrl.updateRecipe);
router.delete('/:id', auth.requireSignin, recipeCtrl.deleteRecipe);

export default router;