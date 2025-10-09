import PantryItem from "../models/pantryItem.model.js";
import Ingredient from "../models/ingredient.model.js";
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
                user_id: 1, // Temporary user_id, replace with actual user ID from auth middleware as needed
                ingredient_id: ingredientId,
                quantity: item.quantity,
                unit: item.unit || ingredient.default_unit,
                notes: item.notes || "",
            });

            insertedItems.push(pantryItem);
        }

        res.status(201).json(insertedItems);
    } catch (err) {
        console.error("insertAllPantryItems error:", err);
        res.status(400).json({ message: err.message });
    }
};

// Create a new pantry item
export const createPantryItem = async (req, res) => {
    try {
        const item = req.body;

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
            user_id: 1, // Temporary user_id, replace with actual user ID from auth middleware as needed
            ingredient_id: ingredientId,
            quantity: item.quantity,
            unit: item.unit || ingredient.default_unit,
            notes: item.notes || "",
        });
        res.status(200).json(pantryItem);
    } catch (err) {
        console.error("insertAllPantryItems error:", err);
        res.status(400).json({ message: err.message });
    }
};

// Get all pantry items
export const getAllPantryItems = async (req, res) => {
    try {
        const pantryItems = await PantryItem.find();
        // find name from ingredient model
        const itemsWithNames = await Promise.all(pantryItems.map(async (item) => {
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
        res.json(itemsWithNames);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a single pantry item by ID
export const getPantryItemById = async (req, res) => {
    try {
        const pantryItem = await PantryItem.findById(req.params.id);
        if (!pantryItem) return res.status(404).json({ message: 'Pantry item not found' });
        res.json(pantryItem);
    } catch (err) {
        res.status(500).json({ message: err.message });
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
        if (!updatedPantryItem) return res.status(404).json({ message: 'Pantry item not found' });
        res.json(updatedPantryItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a pantry item
export const deletePantryItem = async (req, res) => {
    try {
        const deletedPantryItem = await PantryItem.findByIdAndDelete(req.params.id);
        if (!deletedPantryItem) return res.status(404).json({ message: 'Pantry item not found' });
        res.json({ message: 'Pantry item deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export default {
    insertAllPantryItems,
    getAllPantryItems,
    getPantryItemById,
    createPantryItem,
    updatePantryItem,
    deletePantryItem
};
