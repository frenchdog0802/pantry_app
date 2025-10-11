import express from "express";
import shoppingListCtrl from "../controllers/shoppingList.controller.js";

const router = express.Router();
router.post('/bulk', shoppingListCtrl.insertAllShoppingListItems);
router.get('/', shoppingListCtrl.getAllShoppingListItems);
router.get('/:id', shoppingListCtrl.getShoppingListItemById);
router.post('/', shoppingListCtrl.createShoppingListItem);
router.put('/:id', shoppingListCtrl.updateShoppingListItem);
router.delete('/:id', shoppingListCtrl.deleteShoppingListItem);

export default router;
