import ShoppingListItem from "../models/shoppingList.model.js";
import Ingredient from "../models/ingredient.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// Insert all shopping list items
export const insertAllShoppingListItems = async (req, res) => {
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

            const shoppingListItem = await ShoppingListItem.create({
                user_id: userId,
                ingredient_id: ingredientId,
                quantity: item.quantity,
                unit: item.unit || ingredient.default_unit,
                notes: item.notes || "",
            });

            insertedItems.push(shoppingListItem);
        }

        res.json(successResponse(insertedItems));
    } catch (err) {
        console.error("insertAllShoppingListItems error:", err);
        res.json(errorResponse({ message: err.message }));
    }
};

// Create a new shopping list item
export const createShoppingListItem = async (req, res) => {
    try {
        const item = req.body;

        let ingredientObj = undefined;
        const userId = req.auth.user_id;
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

        const shoppingListItem = await ShoppingListItem.create({
            user_id: req.auth.user_id, // Temporary user_id, replace with actual user ID from auth middleware as needed
            ingredient_id: ingredientObj._id,
            quantity: item.quantity,
            unit: item.unit || (typeof ingredientObj !== "undefined" && ingredientObj.default_unit ? ingredientObj.default_unit : ""),
            checked: item.checked || false,
        });
        const returnObject = {
            id: shoppingListItem._id,
            quantity: shoppingListItem.quantity,
            unit: shoppingListItem.unit,
            checked: shoppingListItem.checked,
            name: ingredientObj.name,
        };
        res.json(successResponse(returnObject));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};

// Get all shopping list items
export const getAllShoppingListItems = async (req, res) => {
    try {
        const userId = req.auth.user_id;
        console.log("Fetching shopping list items for user ID:", userId);
        const shoppingListItems = await ShoppingListItem.find({ user_id: userId });
        console.log("Fetched shopping list items:", shoppingListItems);
        // find name from ingredient model
        const itemsWithNames = await Promise.all(shoppingListItems.map(async (item) => {
            const ingredient = await Ingredient.findById(item.ingredient_id);
            return {
                id: item._id.toString(),
                user_id: item.user_id,
                ingredient_id: item.ingredient_id,
                quantity: item.quantity,
                name: ingredient ? ingredient.name : "Unknown",
                unit: ingredient ? item.unit : ingredient.default_unit
            };
        }));
        res.json(successResponse(itemsWithNames));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};

// Get a single shopping list item by ID
export const getShoppingListItemById = async (req, res) => {
    try {
        const shoppingListItem = await ShoppingListItem.findById(req.params.id);
        if (!shoppingListItem) return res.json({ message: 'Shopping list item not found' });
        res.json(successResponse(shoppingListItem));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};

// Update a shopping list item
export const updateShoppingListItem = async (req, res) => {
    try {
        const updatedShoppingListItem = await ShoppingListItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedShoppingListItem) return res.json({ message: 'Shopping list item not found' });
        res.json(successResponse(updatedShoppingListItem));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};

// Delete a shopping list item
export const deleteShoppingListItem = async (req, res) => {
    try {
        const deletedShoppingListItem = await ShoppingListItem.findByIdAndDelete(req.params.id);
        if (!deletedShoppingListItem) return res.json(errorResponse({ message: 'Shopping list item not found' }));
        res.json(successResponse({ message: 'Shopping list item deleted' }));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};

export default {
    insertAllShoppingListItems,
    getAllShoppingListItems,
    getShoppingListItemById,
    createShoppingListItem,
    updateShoppingListItem,
    deleteShoppingListItem
};
