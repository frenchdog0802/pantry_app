import MealPlan from "../models/mealPlan.model.js";
import Recipe from "../models/recipe.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import PantryItem from "../models/pantryItem.model.js";
import RecipeIngredient from "../models/recipeIngredient.model.js";
import Ingredient from "../models/Ingredient.model.js";
import RedisHelper from "../helpers/redisHelper.js";
import shoppingList from "../models/shoppingList.model.js";

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

        const recipe = await Recipe.findById(newMealPlan.recipe_id);
        // check pantry inventory for recipe ingredients is enough
        const pantryCacheItems = await RedisHelper.getCache(RedisHelper.REDIS_KEYS.PANTRY_ITEMS(req.auth.user_id));
        const recipeIngredients = await RecipeIngredient.find({ recipe_id: recipe._id });
        const notEnoughItems = [];
        for (const needIngredients of recipeIngredients) {
            const recordNotEnoughItem = {};

            // find from pantryItems cache first
            let pantryItem = null;
            let ingredient = null;
            if (pantryCacheItems) {
                pantryItem = pantryCacheItems.find(item => item.ingredient_id.toString() === needIngredients.ingredient_id.toString());
            }
            ingredient = await Ingredient.findById(needIngredients.ingredient_id);


            const totalNeededQuantity = pantryItem ? pantryItem.item_planned + needIngredients.quantity : needIngredients.quantity;
            if (!pantryItem || pantryItem.quantity < totalNeededQuantity) {
                recordNotEnoughItem.ingredient_id = needIngredients.ingredient_id;
                recordNotEnoughItem.name = ingredient ? ingredient.name : pantryItem ? pantryItem.name : "Unknown";
                recordNotEnoughItem.required_quantity = totalNeededQuantity - (pantryItem ? pantryItem.quantity : 0);
                recordNotEnoughItem.ingredient_name = pantryItem ? pantryItem.name : ingredient.name;
                recordNotEnoughItem.available_quantity = pantryItem ? pantryItem.quantity : 0;
                notEnoughItems.push(recordNotEnoughItem);

                // add to shopping list
                const existingShoppingListItem = await shoppingList.findOne({
                    user_id: req.auth.user_id,
                    checked: false,
                    ingredient_id: needIngredients.ingredient_id
                });
                if (existingShoppingListItem) {
                    existingShoppingListItem.quantity += needIngredients.quantity;
                    await existingShoppingListItem.save();
                } else {
                    await shoppingList.create({
                        user_id: req.auth.user_id,
                        ingredient_id: needIngredients.ingredient_id,
                        quantity: recordNotEnoughItem.required_quantity,
                        checked: false,
                        unit: ingredient ? ingredient.default_unit : ""
                    });
                }
            }

            // set planned quantity in pantry cache
            if (pantryItem) {
                pantryItem.item_to_buy += needIngredients.quantity;
                pantryItem.item_planned += needIngredients.quantity;
                RedisHelper.setCache(RedisHelper.REDIS_KEYS.PANTRY_ITEMS(req.auth.user_id), pantryCacheItems, 604800);
            }
        }

        const resultMealPlan = {
            id: newMealPlan._id,
            recipe_id: recipe.recipe_id,
            image_url: recipe.image || null,
            meal_name: recipe.meal_name,
            meal_type: newMealPlan.meal_type,
            serving_date: newMealPlan.serving_date,
            notEnoughItems: notEnoughItems
        };
        res.json(successResponse(resultMealPlan));
    } catch (err) {
        console.error(err);
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
        // update pantry planned items before deleting meal plan
        const mealPlan = await MealPlan.findById(req.params.id);
        if (mealPlan) {
            const recipeIngredients = await RecipeIngredient.find({ recipe_id: mealPlan.recipe_id });
            const pantryCacheItems = await RedisHelper.getCache(RedisHelper.REDIS_KEYS.PANTRY_ITEMS(req.auth.user_id));
            for (const needIngredients of recipeIngredients) {
                // find from pantryItems cache first
                let pantryItem = null;
                if (pantryCacheItems) {
                    pantryItem = pantryCacheItems.find(item => item.ingredient_id.toString() === needIngredients.ingredient_id.toString());
                }
                // reduce planned quantity in pantry cache
                if (pantryItem) {
                    pantryItem.item_to_buy -= needIngredients.quantity;
                    pantryItem.item_planned -= needIngredients.quantity;
                    if (pantryItem.item_planned < 0) pantryItem.item_planned = 0;
                    RedisHelper.setCache(RedisHelper.REDIS_KEYS.PANTRY_ITEMS(req.auth.user_id), pantryCacheItems, 604800);
                }
            }
            await MealPlan.findByIdAndDelete(req.params.id);
        } else {
            return res.json(errorResponse({ message: 'Meal plan not found' }));
        }
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
