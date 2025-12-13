import express from "express";
import pantryItemCtrl from "../controllers/pantryItem.controller.js";
import auth from "../controllers/auth.controller.js";

const router = express.Router();
router.post('/bulk', auth.requireSignin, pantryItemCtrl.insertAllPantryItems);
router.put('/bulk', auth.requireSignin, pantryItemCtrl.updateAllPantryItems);
router.get('/', auth.requireSignin, pantryItemCtrl.getAllPantryItems);
router.get('/:id', pantryItemCtrl.getPantryItemById);
router.post('/', auth.requireSignin, pantryItemCtrl.createPantryItem);
router.put('/:id', auth.requireSignin, pantryItemCtrl.updatePantryItem);
router.delete('/:id', auth.requireSignin, pantryItemCtrl.deletePantryItem);

export default router;
