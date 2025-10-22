import express from "express";
import mealPlanCtrl from "../controllers/mealPlan.controller.js";
import { authenticateJWT } from "../controllers/auth.controller.js";
const router = express.Router();
// router.post('/bulk', mealPlanCtrl.insertAllMealPlans);
router.get('/', authenticateJWT, mealPlanCtrl.getAllMealPlans);
router.get('/:id', authenticateJWT, mealPlanCtrl.getMealPlanById);
router.post('/', authenticateJWT, mealPlanCtrl.createMealPlan);
router.put('/:id', authenticateJWT, mealPlanCtrl.updateMealPlan);
router.delete('/:id', authenticateJWT, mealPlanCtrl.deleteMealPlan);

export default router;
