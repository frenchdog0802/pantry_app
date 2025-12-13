import express from "express";
import recipeCtrl from "../controllers/recipe.controller.js";
import auth from "../controllers/auth.controller.js";
const router = express.Router();

router.get('/', auth.requireSignin, recipeCtrl.getAllRecipes);
router.get('/:id', auth.requireSignin, recipeCtrl.getRecipeById);
router.post('/', auth.requireSignin, recipeCtrl.createRecipe);
router.put('/:id', auth.requireSignin, recipeCtrl.updateRecipe);
router.delete('/:id', auth.requireSignin, recipeCtrl.deleteRecipe);

export default router;