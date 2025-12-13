import express from "express";
import shoppingListCtrl from "../controllers/shoppingList.controller.js";
import auth from "../controllers/auth.controller.js";
const router = express.Router();
router.post('/bulk', auth.requireSignin, shoppingListCtrl.insertAllShoppingListItems);
router.get('/', auth.requireSignin, shoppingListCtrl.getAllShoppingListItems);
router.get('/:id', auth.requireSignin, shoppingListCtrl.getShoppingListItemById);
router.post('/', auth.requireSignin, shoppingListCtrl.createShoppingListItem);
router.put('/:id', auth.requireSignin, shoppingListCtrl.updateShoppingListItem);
router.delete('/:id', auth.requireSignin, shoppingListCtrl.deleteShoppingListItem);

export default router;
