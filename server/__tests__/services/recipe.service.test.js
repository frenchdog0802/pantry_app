/**
 * Unit tests for recipe.service.js
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { mockRequest, mockResponse, testData } from '../utils/testUtils.js';

// Mock dependencies
jest.unstable_mockModule('../../models/recipe.model.js', () => ({
    default: {
        find: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn(),
        create: jest.fn(),
    }
}));

jest.unstable_mockModule('../../models/recipeIngredient.model.js', () => ({
    default: {
        find: jest.fn(),
        insertMany: jest.fn(),
        deleteMany: jest.fn(),
    }
}));

jest.unstable_mockModule('../../models/ingredient.model.js', () => ({
    default: {
        findOne: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
    }
}));

describe('Recipe Service', () => {
    let recipeService;
    let Recipe;
    let RecipeIngredient;
    let Ingredient;

    beforeEach(async () => {
        jest.clearAllMocks();

        Recipe = (await import('../../models/recipe.model.js')).default;
        RecipeIngredient = (await import('../../models/recipeIngredient.model.js')).default;
        Ingredient = (await import('../../models/ingredient.model.js')).default;
        recipeService = await import('../../services/recipe.service.js');
    });

    describe('getAllRecipes', () => {
        it('should return empty array when no recipes exist', async () => {
            const req = mockRequest();
            const res = mockResponse();

            Recipe.find.mockResolvedValue([]);

            await recipeService.getAllRecipes(req, res);

            expect(Recipe.find).toHaveBeenCalledWith({ user_id: 'test-user-id' });
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: []
                })
            );
        });

        it('should return recipes with ingredients', async () => {
            const req = mockRequest();
            const res = mockResponse();

            const mockRecipe = testData.recipe();
            const mockIngredient = testData.ingredient();

            Recipe.find.mockResolvedValue([mockRecipe]);
            RecipeIngredient.find.mockResolvedValue([{
                _id: 'ri-123',
                ingredient_id: mockIngredient._id,
                quantity: 100,
                unit: 'g',
            }]);
            Ingredient.findById.mockResolvedValue(mockIngredient);

            await recipeService.getAllRecipes(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.arrayContaining([
                        expect.objectContaining({
                            meal_name: 'Test Recipe',
                            ingredients: expect.arrayContaining([
                                expect.objectContaining({
                                    name: 'Test Ingredient',
                                    quantity: 100,
                                })
                            ])
                        })
                    ])
                })
            );
        });
    });

    describe('getRecipeById', () => {
        it('should return error when recipe not found', async () => {
            const req = mockRequest({ params: { id: 'nonexistent' } });
            const res = mockResponse();

            Recipe.findById.mockResolvedValue(null);

            await recipeService.getRecipeById(req, res);

            expect(res.json).toHaveBeenCalledWith({ message: 'Recipe not found' });
        });

        it('should return recipe with ingredients when found', async () => {
            const req = mockRequest({ params: { id: 'recipe-123' } });
            const res = mockResponse();

            const mockRecipe = testData.recipe();
            const mockIngredient = testData.ingredient();

            Recipe.findById.mockResolvedValue(mockRecipe);
            RecipeIngredient.find.mockResolvedValue([{
                _id: 'ri-123',
                ingredient_id: mockIngredient._id,
                quantity: 100,
                unit: 'g',
            }]);
            Ingredient.findById.mockResolvedValue(mockIngredient);

            await recipeService.getRecipeById(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        meal_name: 'Test Recipe'
                    })
                })
            );
        });
    });

    describe('createRecipe', () => {
        it('should create recipe with ingredients', async () => {
            const req = mockRequest({
                body: {
                    meal_name: 'New Recipe',
                    instructions: 'Step 1, Step 2',
                    ingredients: [
                        { name: 'Salt', quantity: 5, unit: 'g' }
                    ]
                }
            });
            const res = mockResponse();

            const mockRecipe = testData.recipe({ meal_name: 'New Recipe' });
            Recipe.create.mockResolvedValue(mockRecipe);
            Ingredient.findOne.mockResolvedValue(null);
            Ingredient.create.mockResolvedValue(testData.ingredient({ name: 'Salt' }));
            RecipeIngredient.insertMany.mockResolvedValue([]);

            await recipeService.createRecipe(req, res);

            expect(Recipe.create).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        meal_name: 'New Recipe'
                    })
                })
            );
        });
    });

    describe('deleteRecipe', () => {
        it('should delete recipe and its ingredients', async () => {
            const req = mockRequest({ params: { id: 'recipe-123' } });
            const res = mockResponse();

            Recipe.findByIdAndDelete.mockResolvedValue(testData.recipe());
            RecipeIngredient.deleteMany.mockResolvedValue({ deletedCount: 3 });

            await recipeService.deleteRecipe(req, res);

            expect(Recipe.findByIdAndDelete).toHaveBeenCalledWith('recipe-123');
            expect(RecipeIngredient.deleteMany).toHaveBeenCalledWith({ recipe_id: 'recipe-123' });
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: { message: 'Recipe deleted' }
                })
            );
        });

        it('should return error when recipe not found', async () => {
            const req = mockRequest({ params: { id: 'nonexistent' } });
            const res = mockResponse();

            Recipe.findByIdAndDelete.mockResolvedValue(null);

            await recipeService.deleteRecipe(req, res);

            expect(res.json).toHaveBeenCalledWith({ message: 'Recipe not found' });
        });
    });
});
