import express from "express";
import mealPlanCtrl from "../controllers/mealPlan.controller.js";
import auth from "../controllers/auth.controller.js";
const router = express.Router();
// router.post('/bulk', mealPlanCtrl.insertAllMealPlans);
router.get('/', auth.requireSignin, mealPlanCtrl.getAllMealPlans);
router.get('/:id', auth.requireSignin, mealPlanCtrl.getMealPlanById);
router.post('/', auth.requireSignin, mealPlanCtrl.createMealPlan);
router.put('/:id', auth.requireSignin, mealPlanCtrl.updateMealPlan);
router.delete('/:id', auth.requireSignin, mealPlanCtrl.deleteMealPlan);

export default router;
