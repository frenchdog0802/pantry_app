/**
 * Chat Action Handler Service
 * 
 * Handles action-based chat commands. When the AI detects an actionable intent,
 * it returns a structured response with action type that this handler executes.
 * 
 * Architecture:
 * 1. User sends message → Chat route
 * 2. AI analyzes intent → Returns action type if detected
 * 3. Action handler executes the corresponding business logic
 * 4. Result returned to user
 */

import MealPlan from '../models/mealPlan.model.js';
import Recipe from '../models/recipe.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Action Registry
 * Maps action names to their handler functions.
 * Each handler receives (params, userId) and returns { success, data?, error? }
 */
const actionRegistry = {
    'add_recipe_to_menu': addRecipeToMenu,
    'remove_recipe_from_menu': removeRecipeFromMenu,
    'list_my_recipes': listUserRecipes,
    // Add more actions here as needed
};

/**
 * Get list of available actions (for system prompt context)
 */
export function getAvailableActions() {
    return Object.keys(actionRegistry);
}

/**
 * Check if an action exists
 */
export function isValidAction(actionName) {
    return actionRegistry.hasOwnProperty(actionName);
}

/**
 * Execute an action by name
 * @param {string} actionName - The action to execute
 * @param {object} params - Parameters for the action
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function executeAction(actionName, params, userId) {
    if (!isValidAction(actionName)) {
        return { success: false, error: `Unknown action: ${actionName}` };
    }

    if (!userId) {
        return { success: false, error: 'Authentication required for this action' };
    }

    try {
        const handler = actionRegistry[actionName];
        const result = await handler(params, userId);
        return result;
    } catch (error) {
        console.error(`Action ${actionName} failed:`, error);
        return { success: false, error: error.message || 'Action failed' };
    }
}

// ============================================================================
// ACTION IMPLEMENTATIONS
// ============================================================================

/**
 * Add a recipe to the user's meal plan (menu)
 * @param {object} params - { recipeId, mealType?, servingDate? }
 * @param {string} userId
 */
async function addRecipeToMenu(params, userId) {
    const { recipeId, mealType = 'dinner', servingDate } = params;

    // Validate required parameters
    if (!recipeId) {
        return { success: false, error: 'Recipe ID is required' };
    }

    // Verify recipe exists and belongs to user
    const recipe = await Recipe.findOne({ _id: recipeId, user_id: userId });
    if (!recipe) {
        return { success: false, error: 'Recipe not found or not owned by user' };
    }

    // Default to today if no date provided
    const dateTimestamp = servingDate || Math.floor(Date.now() / 1000);

    // Create meal plan entry
    const mealPlan = await MealPlan.create({
        user_id: userId,
        recipe_id: recipeId,
        meal_type: mealType,
        serving_date: dateTimestamp,
    });

    return {
        success: true,
        data: {
            mealPlanId: mealPlan._id,
            recipeName: recipe.meal_name,
            mealType: mealType,
            message: `Added "${recipe.meal_name}" to your ${mealType} menu!`
        }
    };
}

/**
 * Remove a recipe from the user's meal plan
 * @param {object} params - { mealPlanId }
 * @param {string} userId
 */
async function removeRecipeFromMenu(params, userId) {
    const { mealPlanId } = params;

    if (!mealPlanId) {
        return { success: false, error: 'Meal plan ID is required' };
    }

    const mealPlan = await MealPlan.findOne({ _id: mealPlanId, user_id: userId });
    if (!mealPlan) {
        return { success: false, error: 'Meal plan not found' };
    }

    await MealPlan.findByIdAndDelete(mealPlanId);

    return {
        success: true,
        data: { message: 'Recipe removed from menu' }
    };
}

/**
 * List all recipes for the user
 * @param {object} params - (unused currently)
 * @param {string} userId
 */
async function listUserRecipes(params, userId) {
    const recipes = await Recipe.find({ user_id: userId }).select('_id meal_name image');

    return {
        success: true,
        data: {
            recipes: recipes.map(r => ({
                id: r._id,
                name: r.meal_name,
                image: r.image
            })),
            count: recipes.length
        }
    };
}

export default {
    executeAction,
    isValidAction,
    getAvailableActions,
};
