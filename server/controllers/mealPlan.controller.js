import e from "express";
import MealPlan from "../models/mealPlan.model.js";
import Recipe from "../models/recipe.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
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
        res.json(successResponse(returnedMealPlans));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};

// Get a single meal plan by ID
export const getMealPlanById = async (req, res) => {
    try {
        const mealPlan = await MealPlan.findById(req.params.id);
        if (!mealPlan) return res.json(errorResponse({ message: 'Meal plan not found' }));
        res.json(successResponse(mealPlan));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
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
        res.json(successResponse(newMealPlan));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
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
        if (!updatedMealPlan) return res.json(errorResponse({ message: 'Meal plan not found' }));
        res.json(successResponse(updatedMealPlan));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};

// Delete a meal plan
export const deleteMealPlan = async (req, res) => {
    try {
        const deletedMealPlan = await MealPlan.findByIdAndDelete(req.params.id);
        if (!deletedMealPlan) return res.json(errorResponse({ message: 'Meal plan not found' }));
        res.json(successResponse({ message: 'Meal plan deleted' }));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};

export default {
    getAllMealPlans,
    getMealPlanById,
    createMealPlan,
    updateMealPlan,
    deleteMealPlan
};
