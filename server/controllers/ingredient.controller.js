import Ingredient from "../models/ingredient.model.js";

// Insert all
export const insertAllIngredients = async (req, res) => {
    try {
        const ingredients = await Ingredient.insertMany(req.body);
        res.status(201).json(ingredients);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get all ingredients
export const getAllIngredients = async (req, res) => {
    // Optional query parameter to filter ingredients by name
    const { query } = req.query;
    try {
        const ingredients = await Ingredient.find(
            query ? { name: { $regex: query, $options: 'i' } } : {}
        ).limit(10);
        res.json(ingredients);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a single ingredient by ID
export const getIngredientById = async (req, res) => {
    try {
        const ingredient = await Ingredient.findById(req.params.id);
        if (!ingredient) return res.status(404).json({ message: 'Ingredient not found' });
        res.json(ingredient);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new ingredient
export const createIngredient = async (req, res) => {
    const ingredient = new Ingredient(req.body);
    try {
        const newIngredient = await ingredient.save();
        res.status(201).json(newIngredient);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update an ingredient
export const updateIngredient = async (req, res) => {
    try {
        const updatedIngredient = await Ingredient.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedIngredient) return res.status(404).json({ message: 'Ingredient not found' });
        res.json(updatedIngredient);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete an ingredient
export const deleteIngredient = async (req, res) => {
    try {
        const deletedIngredient = await Ingredient.findByIdAndDelete(req.params.id);
        if (!deletedIngredient) return res.status(404).json({ message: 'Ingredient not found' });
        res.json({ message: 'Ingredient deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export default {
    insertAllIngredients,
    getAllIngredients,
    getIngredientById,
    createIngredient,
    updateIngredient,
    deleteIngredient
};
