import express from "express";
import pantryItemCtrl from "../services/pantryItem.service.js";
import auth from "../services/auth.service.js";

const router = express.Router();
router.post('/bulk', auth.requireSignin, pantryItemCtrl.insertAllPantryItems);
router.put('/bulk', auth.requireSignin, pantryItemCtrl.updateAllPantryItems);
router.get('/', auth.requireSignin, pantryItemCtrl.getAllPantryItems);
router.get('/:id', pantryItemCtrl.getPantryItemById);
router.post('/', auth.requireSignin, pantryItemCtrl.createPantryItem);
router.put('/:id', auth.requireSignin, pantryItemCtrl.updatePantryItem);
router.delete('/:id', auth.requireSignin, pantryItemCtrl.deletePantryItem);

export default router;
