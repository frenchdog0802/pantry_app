import express from "express";
import mealPlanCtrl from "../controllers/mealPlan.controller.js";

const router = express.Router();
// router.post('/bulk', mealPlanCtrl.insertAllMealPlans);
router.get('/', mealPlanCtrl.getAllMealPlans);
router.get('/:id', mealPlanCtrl.getMealPlanById);
router.post('/', mealPlanCtrl.createMealPlan);
router.put('/:id', mealPlanCtrl.updateMealPlan);
router.delete('/:id', mealPlanCtrl.deleteMealPlan);

export default router;
