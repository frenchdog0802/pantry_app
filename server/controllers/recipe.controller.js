import Recipe from "../models/recipe.model.js";
import RecipeIngredient from "../models/recipeIngredient.model.js";
import Ingredient from "../models/ingredient.model.js";

// Create a new recipe
export const createRecipe = async (req, res) => {
    const items = req.body;
    try {
        const newRecipe = await Recipe.create({
            user_id: 1,//temporary user_id, replace with actual user ID from auth middleware as needed
            folder_id: items.folder_id,
            meal_name: items.meal_name,
            instructions: items.instructions,
            image_url: items.image_url,
        })
        if (Array.isArray(items.ingredients) && items.ingredients.length > 0) {
            const docs = items.ingredients.map(ingredient => ({
                recipe_id: newRecipe._id,
                ingredient_id: ingredient.id,
                quantity: ingredient.quantity,
                unit: ingredient.unit,
            }));
            await RecipeIngredient.insertMany(docs);
        }

        const returnObject = {
            id: newRecipe._id,
            meal_name: newRecipe.meal_name,
            instructions: newRecipe.instructions,
            image_url: newRecipe.image_url,
            ingredients: items.ingredients,
        }
        res.status(200).json(returnObject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get all recipes
export const getAllRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find();
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
                image_url: recipe.image_url,
                ingredients: returnIngredients,
            })
        }
        res.status(200).json(returnRecipes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a single recipe by ID
export const getRecipeById = async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
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
        image_url: recipe.image_url,
        ingredients: returnIngredients,
    }
    res.status(200).json(returnObject);
};



// Update a recipe
export const updateRecipe = async (req, res) => {
    const items = req.body;
    const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, items, { new: true });
    // Update recipeIngredients
    await RecipeIngredient.deleteMany({ recipe_id: req.params.id });
    if (Array.isArray(items.ingredients) && items.ingredients.length > 0) {
        const docs = items.ingredients.map(ingredient => ({
            recipe_id: updatedRecipe._id,
            ingredient_id: ingredient.id,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
        }));
        await RecipeIngredient.insertMany(docs);
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
        image_url: updatedRecipe.image_url,
        ingredients: returnIngredients,
    }
    if (!updatedRecipe) return res.status(404).json({ message: 'Recipe not found' });
    res.status(200).json(returnObject);
}
// Delete a recipe
export const deleteRecipe = async (req, res) => {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    await RecipeIngredient.deleteMany({ recipe_id: req.params.id });
    if (!deletedRecipe) return res.status(404).json({ message: 'Recipe not found' });
    res.status(200).json({ message: 'Recipe deleted' });
};

export default {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe
};