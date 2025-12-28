import express from "express";
import mealPlanCtrl from "../services/mealPlan.service.js";
import auth from "../services/auth.service.js";
const router = express.Router();
// router.post('/bulk', mealPlanCtrl.insertAllMealPlans);
router.get('/', auth.requireSignin, mealPlanCtrl.getAllMealPlans);
router.get('/:id', auth.requireSignin, mealPlanCtrl.getMealPlanById);
router.post('/', auth.requireSignin, mealPlanCtrl.createMealPlan);
router.put('/:id', auth.requireSignin, mealPlanCtrl.updateMealPlan);
router.delete('/:id', auth.requireSignin, mealPlanCtrl.deleteMealPlan);

export default router;
