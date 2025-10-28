import MealPlan from "../models/mealPlan.model.js";
import Recipe from "../models/recipe.model.js";
// Get all meal plans
export const getAllMealPlans = async (req, res) => {
    try {
        const userId = req.auth.user_id;
        const mealPlans = await MealPlan.find({ user_id: userId });
        // search for recipe name and image in req if exists
        const returnedMealPlans = [];
        for (const mealPlan of mealPlans) {
            const recipe = await Recipe.findById(mealPlan.recipe_id);

            if (recipe) {
                const mealPlanObj = {
                    id: mealPlan._id,
                    recipe_id: mealPlan.recipe_id,
                    meal_name: recipe.meal_name,
                    image_url: recipe.image || null,
                    meal_type: mealPlan.meal_type,
                    serving_date: mealPlan.serving_date,
                };
                returnedMealPlans.push(mealPlanObj);
            }
        }
        res.json(returnedMealPlans);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a single meal plan by ID
export const getMealPlanById = async (req, res) => {
    try {
        const mealPlan = await MealPlan.findById(req.params.id);
        if (!mealPlan) return res.status(404).json({ message: 'Meal plan not found' });
        res.json(mealPlan);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new meal plan
export const createMealPlan = async (req, res) => {
    const request = req.body;
    try {
        const newMealPlan = await MealPlan.create({
            user_id: req.auth.user_id,
            recipe_id: request.recipe_id,
            meal_type: request.meal_type,
            serving_date: request.serving_date,
        })
        res.status(200).json(newMealPlan);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update a meal plan
export const updateMealPlan = async (req, res) => {
    try {
        const updatedMealPlan = await MealPlan.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedMealPlan) return res.status(404).json({ message: 'Meal plan not found' });
        res.json(updatedMealPlan);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a meal plan
export const deleteMealPlan = async (req, res) => {
    try {
        const deletedMealPlan = await MealPlan.findByIdAndDelete(req.params.id);
        if (!deletedMealPlan) return res.status(404).json({ message: 'Meal plan not found' });
        res.json({ message: 'Meal plan deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export default {
    getAllMealPlans,
    getMealPlanById,
    createMealPlan,
    updateMealPlan,
    deleteMealPlan
};
