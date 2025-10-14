import express from "express";
import pantryItemCtrl from "../controllers/pantryItem.controller.js";

const router = express.Router();
router.post('/bulk', pantryItemCtrl.insertAllPantryItems);
router.put('/bulk', pantryItemCtrl.updateAllPantryItems);
router.get('/', pantryItemCtrl.getAllPantryItems);
router.get('/:id', pantryItemCtrl.getPantryItemById);
router.post('/', pantryItemCtrl.createPantryItem);
router.put('/:id', pantryItemCtrl.updatePantryItem);
router.delete('/:id', pantryItemCtrl.deletePantryItem);

export default router;
