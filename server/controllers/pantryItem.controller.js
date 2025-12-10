import PantryItem from "../models/pantryItem.model.js";
import Ingredient from "../models/ingredient.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import ShoppingListItem from "../models/shoppingList.model.js";
import MealPlan from "../models/mealPlan.model.js";
import RecipeIngredient from "../models/recipeIngredient.model.js";

// Insert all
export const insertAllPantryItems = async (req, res) => {
    try {
        const items = req.body;
        const insertedItems = [];

        for (const item of items) {
            let ingredientId = item.ingredient_id;

            if (!ingredientId) {
                if (!item.name) {
                    throw new Error("Missing 'name' field when ingredient_id is not provided");
                }

                let ingredient = await Ingredient.findOne({
                    name: item.name
                });

                if (!ingredient) {
                    ingredient = await Ingredient.create({
                        name: item.name,
                        default_unit: item.unit || ""
                    });
                }

                ingredientId = ingredient._id;
            }

            const pantryItem = await PantryItem.create({
                user_id: req.auth.user_id,
                ingredient_id: ingredientId,
                quantity: item.quantity,
                unit: item.unit || ingredient.default_unit,
                notes: item.notes || "",
            });

            insertedItems.push(pantryItem);
        }

        res.json(successResponse(insertedItems));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};

// Create a new pantry item
export const createPantryItem = async (req, res) => {
    try {
        const item = req.body;

        let ingredientObj = undefined;

        if (!ingredientObj) {
            if (!item.name) {
                throw new Error("Missing 'name' field when ingredient_id is not provided");
            }

            let ingredient = await Ingredient.findOne({
                name: item.name
            });

            if (!ingredient) {
                ingredient = await Ingredient.create({
                    name: item.name,
                    default_unit: item.unit || ""
                });
            }

            ingredientObj = ingredient;
        }

        const pantryItem = await PantryItem.create({
            user_id: req.auth.user_id,
            ingredient_id: ingredientObj._id,
            quantity: item.quantity,
            unit: item.unit || ingredientObj.default_unit,
            notes: item.notes || "",
        });

        const returnObject = {
            id: pantryItem._id,
            quantity: pantryItem.quantity,
            unit: pantryItem.unit,
            notes: pantryItem.notes,
            name: ingredientObj.name,
        };

        res.json(successResponse(returnObject));
    } catch (err) {
        console.error("insertAllPantryItems error:", err);
        res.json(errorResponse({ message: err.message }));
    }
};

// Get all pantry items
export const getAllPantryItems = async (req, res) => {
    try {
        const userId = req.auth.user_id;
        const pantryItems = await PantryItem.find({ user_id: userId });
        // find item to buy from shopping list 
        const shoppingListItems = await ShoppingListItem.find({ user_id: userId });
        // find planned meals from meal plan serving_date greater than today 
        const today = new Date().toISOString().split('T')[0];
        const mealPlans = await MealPlan.find({ user_id: userId, serving_date: { $gte: today } });
        // find recipe ingredients from meal plans
        const recipeIngredients = await RecipeIngredient.find({ recipe_id: { $in: mealPlans.map(mp => mp.recipe_id) } });
        // find name from ingredient model
        const itemsWithNames = await Promise.all(pantryItems.map(async (item) => {
            const ingredient = await Ingredient.findById(item.ingredient_id);
            const itemToBuy = shoppingListItems.find(sItem => sItem.ingredient_id === item.ingredient_id);
            const itemPlanned = recipeIngredients.find(rIngredient => rIngredient.ingredient_id === item.ingredient_id);
            return {
                id: item._id.toString(),
                user_id: item.user_id,
                ingredient_id: item.ingredient_id,
                quantity: item.quantity,
                item_to_buy: itemToBuy ? itemToBuy.quantity : 0,
                item_planned: itemPlanned ? itemPlanned.quantity : 0,
                name: ingredient ? ingredient.name : "Unknown",
                unit: ingredient ? item.unit : ingredient.default_unit
            };
        }));
        res.json(successResponse(itemsWithNames));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};

// Get a single pantry item by ID
export const getPantryItemById = async (req, res) => {
    try {
        const pantryItem = await PantryItem.findById(req.params.id);
        if (!pantryItem) return res.json({ message: 'Pantry item not found' });
        res.json(successResponse(pantryItem));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};



// Update a pantry item
export const updatePantryItem = async (req, res) => {
    try {
        const updatedPantryItem = await PantryItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedPantryItem) return res.json(errorResponse({ message: 'Pantry item not found' }));
        res.json(successResponse(updatedPantryItem));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};

// Delete a pantry item
export const deletePantryItem = async (req, res) => {
    try {
        const deletedPantryItem = await PantryItem.findByIdAndDelete(req.params.id);
        if (!deletedPantryItem) return res.json(errorResponse({ message: 'Pantry item not found' }));
        res.json(successResponse({ message: 'Pantry item deleted' }));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};

// Bulk update pantry items
export const updateAllPantryItems = async (req, res) => {
    try {
        const items = req.body;
        if (!Array.isArray(items)) {
            return res.json({ message: 'Request body must be an array of items' });
        }

        const updatedResults = [];

        for (const item of items) {
            if (!item.id) {
                return res.json({ message: 'Each item must include an id' });
            }

            const updateFields = {};
            if (item.quantity !== undefined) updateFields.quantity = item.quantity;
            if (item.unit !== undefined) updateFields.unit = item.unit;
            if (item.notes !== undefined) updateFields.notes = item.notes;

            const updated = await PantryItem.findByIdAndUpdate(
                item.id,
                updateFields,
                { new: true }
            );

            if (!updated) {
                return res.json({ message: `Pantry item not found: ${item.id}` });
            }

            const ingredient = await Ingredient.findById(updated.ingredient_id);
            updatedResults.push({
                id: updated._id.toString(),
                quantity: updated.quantity,
                unit: updated.unit,
                notes: updated.notes,
                name: ingredient ? ingredient.name : 'Unknown',
            });
        }

        res.json(successResponse(updatedResults));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};

export default {
    insertAllPantryItems,
    getAllPantryItems,
    getPantryItemById,
    createPantryItem,
    updatePantryItem,
    deletePantryItem,
    updateAllPantryItems
};
