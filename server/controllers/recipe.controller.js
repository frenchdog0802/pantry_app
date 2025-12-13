import Recipe from "../models/recipe.model.js";
import RecipeIngredient from "../models/recipeIngredient.model.js";
import Ingredient from "../models/ingredient.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// Create a new recipe
export const createRecipe = async (req, res) => {
    const items = req.body;
    try {
        const newRecipe = await Recipe.create({
            user_id: req.auth.user_id,
            folder_id: items.folder_id,
            meal_name: items.meal_name,
            instructions: items.instructions,
            image: items.image
        })
        if (Array.isArray(items.ingredients) && items.ingredients.length > 0) {
            const recipeIngredientsToInsert = await Promise.all(items.ingredients.map(async (itemIngredient) => {
                let ingredientRecord = await Ingredient.findOne({ name: itemIngredient.name });
                if (!ingredientRecord) {
                    ingredientRecord = await Ingredient.create({ name: itemIngredient.name, default_unit: itemIngredient.unit });
                }
                return {
                    recipe_id: newRecipe._id,
                    ingredient_id: ingredientRecord._id,
                    quantity: itemIngredient.quantity,
                    unit: itemIngredient.unit,
                };
            }));
            await RecipeIngredient.insertMany(recipeIngredientsToInsert);
        }

        const returnObject = {
            id: newRecipe._id,
            meal_name: newRecipe.meal_name,
            instructions: newRecipe.instructions,
            ingredients: items.ingredients,
            image: newRecipe.image,
        }
        res.json(successResponse(returnObject));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};

// Get all recipes
export const getAllRecipes = async (req, res) => {
    try {
        const userId = req.auth.user_id;
        const recipes = await Recipe.find({ user_id: userId });
        const returnRecipes = [];
        for (const recipe of recipes) {
            const returnIngredients = [];
            const ingredients = await RecipeIngredient.find({ recipe_id: recipe._id });
            for (const ingredient of ingredients) {
                const ingredientObj = await Ingredient.findById(ingredient.ingredient_id);
                if (!ingredientObj) continue;
                returnIngredients.push({
                    id: ingredient._id,
                    name: ingredientObj.name,
                    quantity: ingredient.quantity,
                    unit: ingredient.unit,
                })
            }
            returnRecipes.push({
                id: recipe._id,
                folder_id: recipe.folder_id,
                meal_name: recipe.meal_name,
                instructions: recipe.instructions,
                ingredients: returnIngredients,
                image: recipe.image,
            })
        }
        res.json(successResponse(returnRecipes));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};

// Get a single recipe by ID
export const getRecipeById = async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.json({ message: 'Recipe not found' });
    const returnIngredients = [];
    const ingredients = await RecipeIngredient.find({ recipe_id: recipe._id });
    for (const ingredient of ingredients) {
        const ingredientObj = await Ingredient.findById(ingredient.ingredient_id);
        returnIngredients.push({
            id: ingredient._id,
            name: ingredientObj.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
        })
    }
    const returnObject = {
        id: recipe._id,
        meal_name: recipe.meal_name,
        instructions: recipe.instructions,
        ingredients: returnIngredients,
        image: recipe.image,
    }
    res.json(successResponse(returnObject));
};



// Update a recipe
export const updateRecipe = async (req, res) => {
    const items = req.body;
    const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, items, { new: true });
    // Update recipeIngredients
    await RecipeIngredient.deleteMany({ recipe_id: req.params.id });
    if (Array.isArray(items.ingredients) && items.ingredients.length > 0) {
        const recipeIngredientsToInsert = await Promise.all(items.ingredients.map(async (itemIngredient) => {
            let ingredientRecord = await Ingredient.findOne({ name: itemIngredient.name });
            if (!ingredientRecord) {
                ingredientRecord = await Ingredient.create({ name: itemIngredient.name, unit: itemIngredient.unit });
            }
            return {
                recipe_id: req.params.id,
                ingredient_id: ingredientRecord._id,
                quantity: itemIngredient.quantity,
                unit: itemIngredient.unit,
            };
        }));
        await RecipeIngredient.insertMany(recipeIngredientsToInsert);
    }

    const returnIngredients = [];
    const ingredients = await RecipeIngredient.find({ recipe_id: updatedRecipe._id });
    for (const ingredient of ingredients) {
        const ingredientObj = await Ingredient.findById(ingredient.ingredient_id);
        returnIngredients.push({
            id: ingredient._id,
            name: ingredientObj.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
        })
    }
    const returnObject = {
        id: updatedRecipe._id,
        meal_name: updatedRecipe.meal_name,
        instructions: updatedRecipe.instructions,
        ingredients: returnIngredients,
        image: updatedRecipe.image,
    }
    if (!updatedRecipe) return res.json({ message: 'Recipe not found' });
    res.json(successResponse(returnObject));
}
// Delete a recipe
export const deleteRecipe = async (req, res) => {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    await RecipeIngredient.deleteMany({ recipe_id: req.params.id });
    if (!deletedRecipe) return res.json({ message: 'Recipe not found' });
    res.json(successResponse({ message: 'Recipe deleted' }));
};

export default {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe
};