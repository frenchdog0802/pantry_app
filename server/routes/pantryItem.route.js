import express from "express";
import pantryItemCtrl from "../controllers/pantryItem.controller.js";
import { authenticateJWT } from "../controllers/auth.controller.js";

const router = express.Router();
router.post('/bulk', authenticateJWT, pantryItemCtrl.insertAllPantryItems);
router.put('/bulk', authenticateJWT, pantryItemCtrl.updateAllPantryItems);
router.get('/', authenticateJWT, pantryItemCtrl.getAllPantryItems);
router.get('/:id', pantryItemCtrl.getPantryItemById);
router.post('/', authenticateJWT, pantryItemCtrl.createPantryItem);
router.put('/:id', authenticateJWT, pantryItemCtrl.updatePantryItem);
router.delete('/:id', authenticateJWT, pantryItemCtrl.deletePantryItem);

export default router;
