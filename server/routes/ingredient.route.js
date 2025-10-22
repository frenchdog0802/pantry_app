import express from "express";
import ingredientCtrl from "../controllers/ingredient.controller.js";
import { authenticateJWT } from "../controllers/auth.controller.js";

const router = express.Router();
router.post('/bulk', authenticateJWT, ingredientCtrl.insertAllIngredients);
router.get('/', authenticateJWT, ingredientCtrl.getAllIngredients);
router.get('/:id', authenticateJWT, ingredientCtrl.getIngredientById);
router.post('/', authenticateJWT, ingredientCtrl.createIngredient);
router.put('/:id', authenticateJWT, ingredientCtrl.updateIngredient);
router.delete('/:id', authenticateJWT, ingredientCtrl.deleteIngredient);


export default router;