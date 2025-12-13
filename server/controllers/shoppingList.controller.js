import ShoppingListItem from "../models/shoppingList.model.js";
import Ingredient from "../models/ingredient.model.js";
import PantryItem from "../models/pantryItem.model.js";
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
                unit: ingredient ? item.unit : ingredient.default_unit,
                checked: item.checked,
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
        const updatedItem = await ShoppingListItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedItem) {
            return res.json({ message: 'Shopping list item not found' });
        }

        console.log('Updated shopping list item:', updatedItem);

        const resultItem = {
            id: updatedItem._id.toString(),
            pantry_item_id: '',
            new_quantity: updatedItem.quantity,
            new_item_to_buy: updatedItem.quantity,
            checked: updatedItem.checked,
        };

        // Handle pantry synchronization based on checked status
        if (updatedItem.checked) {
            await handleCheckItem(updatedItem, resultItem);
        } else if (updatedItem.has_been_added_to_pantry) {
            await handleUncheckItem(updatedItem, resultItem);
        }

        res.json(successResponse(resultItem));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};

/**
 * Handles adding/updating the item in pantry when checked.
 * @param {Object} shoppingItem - The updated shopping list item.
 * @param {Object} resultItem - The result object to update.
 */
const handleCheckItem = async (shoppingItem, resultItem) => {
    if (shoppingItem.has_been_added_to_pantry) {
        return; // Already added, no action needed
    }

    const { user_id, ingredient_id, quantity, unit } = shoppingItem;
    const existingPantryItem = await PantryItem.findOne({
        user_id,
        ingredient_id,
    });

    let newPantryQuantity;
    if (existingPantryItem) {
        newPantryQuantity = (existingPantryItem.quantity || 0) + (quantity || 0);
        existingPantryItem.quantity = newPantryQuantity;
        await existingPantryItem.save();
    } else {
        await PantryItem.create({
            user_id,
            ingredient_id,
            quantity: quantity || 0,
            unit: unit || '',
        });
        newPantryQuantity = quantity || 0;
    }

    // Update shopping item flag
    shoppingItem.has_been_added_to_pantry = true;
    await shoppingItem.save();

    // Update result
    resultItem.new_quantity = newPantryQuantity;
    resultItem.new_item_to_buy = 0;
    resultItem.pantry_item_id = existingPantryItem ? existingPantryItem._id.toString() : '';
};

/**
 * Handles subtracting the item from pantry when unchecked.
 * @param {Object} shoppingItem - The updated shopping list item.
 * @param {Object} resultItem - The result object to update.
 */
const handleUncheckItem = async (shoppingItem, resultItem) => {
    const { user_id, ingredient_id, quantity } = shoppingItem;
    const pantryItem = await PantryItem.findOne({
        user_id,
        ingredient_id,
    });

    if (!pantryItem) {
        return; // No pantry item to update
    }

    const newPantryQuantity = Math.max(
        0,
        (pantryItem.quantity || 0) - (quantity || 0)
    );
    pantryItem.quantity = newPantryQuantity;
    await pantryItem.save();

    // Update shopping item flag
    shoppingItem.has_been_added_to_pantry = false;
    await shoppingItem.save();

    // Update result
    resultItem.new_quantity = newPantryQuantity;
    resultItem.new_item_to_buy = quantity || 0;
    resultItem.pantry_item_id = pantryItem._id.toString();
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
