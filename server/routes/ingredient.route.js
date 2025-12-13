import express from "express";
import ingredientCtrl from "../controllers/ingredient.controller.js";
import auth from "../controllers/auth.controller.js";

const router = express.Router();
router.post('/bulk', auth.requireSignin, ingredientCtrl.insertAllIngredients);
router.get('/', auth.requireSignin, ingredientCtrl.getAllIngredients);
router.get('/:id', auth.requireSignin, ingredientCtrl.getIngredientById);
router.post('/', auth.requireSignin, ingredientCtrl.createIngredient);
router.put('/:id', auth.requireSignin, ingredientCtrl.updateIngredient);
router.delete('/:id', auth.requireSignin, ingredientCtrl.deleteIngredient);


export default router;