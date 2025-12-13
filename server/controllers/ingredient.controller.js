import Ingredient from "../models/ingredient.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// Insert all
export const insertAllIngredients = async (req, res) => {
    try {
        const ingredients = await Ingredient.insertMany(req.body);
        res.json(successResponse(ingredients));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
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
        res.json(successResponse(ingredients));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};

// Get a single ingredient by ID
export const getIngredientById = async (req, res) => {
    try {
        const ingredient = await Ingredient.findById(req.params.id);
        if (!ingredient) return res.json(errorResponse({ message: 'Ingredient not found' }));
        res.json(successResponse(ingredient));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};

// Create a new ingredient
export const createIngredient = async (req, res) => {
    const ingredient = new Ingredient(req.body);
    try {
        const newIngredient = await ingredient.save();
        res.json(successResponse(newIngredient));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
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
        if (!updatedIngredient) return res.json(errorResponse({ message: 'Ingredient not found' }));
        res.json(successResponse(updatedIngredient));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};

// Delete an ingredient
export const deleteIngredient = async (req, res) => {
    try {
        const deletedIngredient = await Ingredient.findByIdAndDelete(req.params.id);
        if (!deletedIngredient) return res.json(errorResponse({ message: 'Ingredient not found' }));
        res.json(successResponse({ message: 'Ingredient deleted' }));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
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
