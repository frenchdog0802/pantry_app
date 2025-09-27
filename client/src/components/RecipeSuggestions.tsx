import React from 'react';
import { ArrowLeftIcon, ShoppingCartIcon } from 'lucide-react';
import { usePantry } from '../contexts/PantryContext';
import { RecipeCard } from './RecipeCard';
interface RecipeSuggestionsProps {
  onSelectRecipe: (recipe: any) => void;
  onBack: () => void;
}
export function RecipeSuggestions({
  onSelectRecipe,
  onBack
}: RecipeSuggestionsProps) {
  const {
    recipeSuggestions,
    pantryItems
  } = usePantry();
  // Filter recipes based on available ingredients
  const cookNowRecipes = recipeSuggestions.filter(recipe => recipe.ingredients.every(ingredient => pantryItems.some(item => item.name.toLowerCase() === ingredient.name.toLowerCase() && item.quantity >= ingredient.quantity)));
  const needsOneItemRecipes = recipeSuggestions.filter(recipe => {
    const missingIngredients = recipe.ingredients.filter(ingredient => !pantryItems.some(item => item.name.toLowerCase() === ingredient.name.toLowerCase() && item.quantity >= ingredient.quantity));
    return missingIngredients.length === 1;
  });
  return <div className="flex flex-col w-full min-h-screen bg-gray-50">
    {/* Header */}
    <header className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-5 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Go back">
          <ArrowLeftIcon size={24} />
        </button>
        <h1 className="text-xl font-bold">Recipe Suggestions</h1>
        <div className="w-10"></div> {/* For layout balance */}
      </div>
    </header>
    {/* Main Content */}
    <main className="flex-1 container mx-auto p-5">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Cook Now</h2>
        <p className="text-gray-600 mb-5">
          Recipes you can make with what you have
        </p>
        {cookNowRecipes.length > 0 ? <div className="space-y-5">
          {cookNowRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} onSelect={() => onSelectRecipe(recipe)} readiness="ready" />)}
        </div> : <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500">
            No recipes available with current ingredients.
          </p>
        </div>}
      </div>
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Almost There
        </h2>
        <p className="text-gray-600 mb-5">
          Just missing one ingredient to make these
        </p>
        {needsOneItemRecipes.length > 0 ? <div className="space-y-5">
          {needsOneItemRecipes.map(recipe => {
            const missingIngredient = recipe.ingredients.find(ingredient => !pantryItems.some(item => item.name.toLowerCase() === ingredient.name.toLowerCase() && item.quantity >= ingredient.quantity));
            return <RecipeCard key={recipe.id} recipe={recipe} onSelect={() => onSelectRecipe(recipe)} readiness="missing-one" missingIngredient={missingIngredient} />;
          })}
        </div> : <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500">
            No recipes available needing just one item.
          </p>
        </div>}
      </div>
    </main>
  </div>;
}