import express from "express";
import shoppingListCtrl from "../controllers/shoppingList.controller.js";
import { authenticateJWT } from "../controllers/auth.controller.js";
const router = express.Router();
router.post('/bulk', authenticateJWT, shoppingListCtrl.insertAllShoppingListItems);
router.get('/', authenticateJWT, shoppingListCtrl.getAllShoppingListItems);
router.get('/:id', authenticateJWT, shoppingListCtrl.getShoppingListItemById);
router.post('/', authenticateJWT, shoppingListCtrl.createShoppingListItem);
router.put('/:id', authenticateJWT, shoppingListCtrl.updateShoppingListItem);
router.delete('/:id', authenticateJWT, shoppingListCtrl.deleteShoppingListItem);

export default router;
