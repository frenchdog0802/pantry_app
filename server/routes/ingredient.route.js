import express from "express";
import ingredientCtrl from "../controllers/ingredient.controller.js";


const router = express.Router();
router.post('/bulk', ingredientCtrl.insertAllIngredients);
router.get('/', ingredientCtrl.getAllIngredients);
router.get('/:id', ingredientCtrl.getIngredientById);
router.post('/', ingredientCtrl.createIngredient);
router.put('/:id', ingredientCtrl.updateIngredient);
router.delete('/:id', ingredientCtrl.deleteIngredient);


export default router;