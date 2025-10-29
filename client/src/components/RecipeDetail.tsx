import React, { useState } from 'react';
import { ArrowLeftIcon, CheckCircleIcon, ShoppingCartIcon } from 'lucide-react';
import { usePantry } from '../contexts/pantryContext';
interface RecipeDetailProps {
  recipe: any;
  onBack: () => void;
}
export function RecipeDetail({
  recipe,
  onBack
}: RecipeDetailProps) {
  const {
    pantryItems,
    updatePantryItems,
    addToCookingHistory
  } = usePantry();
  const [cooked, setCooked] = useState(false);
  const handleCookNow = () => {
    // Update pantry by decreasing used ingredients
    const updatedPantry = pantryItems.map(item => {
      const usedIngredient = recipe.ingredients.find(ing => ing.name.toLowerCase() === item.name.toLowerCase());
      if (usedIngredient) {
        return {
          ...item,
          quantity: Math.max(0, item.quantity - usedIngredient.quantity)
        };
      }
      return item;
    });
    // Update pantry and add to cooking history
    updatePantryItems(updatedPantry);
    addToCookingHistory(recipe);
    setCooked(true);
  };
  const checkIngredientAvailability = ingredient => {
    const pantryItem = pantryItems.find(item => item.name.toLowerCase() === ingredient.name.toLowerCase());
    if (!pantryItem) return 'missing';
    if (pantryItem.quantity < ingredient.quantity) return 'insufficient';
    return 'available';
  };
  return <div className="flex flex-col w-full min-h-screen bg-gray-50">
    {/* Header */}
    <header className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-5 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Go back">
          <ArrowLeftIcon size={24} />
        </button>
        <h1 className="text-xl font-bold">Recipe Details</h1>
        <div className="w-10"></div> {/* For layout balance */}
      </div>
    </header>
    {/* Recipe Image */}
    <div className="w-full h-64 relative">
      <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h2 className="text-2xl font-bold text-white">{recipe.name}</h2>
        <p className="text-white/90">
          {recipe.cookTime} mins • {recipe.difficulty}
        </p>
      </div>
    </div>
    {/* Main Content */}
    <main className="flex-1 container mx-auto p-5">
      {cooked ? <div className="bg-green-50 p-4 rounded-xl mb-6 flex items-center border border-green-100">
        <CheckCircleIcon className="text-green-600 mr-3" size={24} />
        <div>
          <h3 className="font-semibold text-green-800">Recipe Cooked!</h3>
          <p className="text-green-700 text-sm">
            Your pantry has been updated and added to your calendar
          </p>
        </div>
      </div> : null}
      {/* Ingredients Section */}
      <section className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Ingredients</h3>
        <ul className="space-y-3">
          {recipe.ingredients.map((ingredient, index) => {
            const availability = checkIngredientAvailability(ingredient);
            return <li key={index} className={`flex justify-between items-center p-3 rounded-lg ${availability === 'available' ? 'bg-red-50 border border-red-100' : availability === 'insufficient' ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50 border border-gray-100'}`}>
              <span className="font-medium">
                {ingredient.quantity} {ingredient.unit} {ingredient.name}
              </span>
              {availability === 'missing' && <button className="text-amber-600 flex items-center text-sm font-medium bg-white px-3 py-1 rounded-lg border border-amber-200">
                <ShoppingCartIcon size={16} className="mr-1" />
                Add to list
              </button>}
            </li>;
          })}
        </ul>
      </section>
      {/* Instructions Section */}
      <section className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Instructions</h3>
        <ol className="space-y-5">
          {recipe.instructions.map((step, index) => <li key={index} className="flex">
            <div className="bg-red-100 rounded-full w-8 h-8 flex items-center justify-center text-red-700 font-semibold mr-4 flex-shrink-0 mt-0.5">
              {index + 1}
            </div>
            <p className="text-gray-700">{step}</p>
          </li>)}
        </ol>
      </section>
      {/* Swap Suggestions */}
      {recipe.swaps && recipe.swaps.length > 0 && <section className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Ingredient Swaps
        </h3>
        <ul className="space-y-3">
          {recipe.swaps.map((swap, index) => <li key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex items-center">
              <span className="font-medium text-gray-800">
                {swap.original}
              </span>
              <span className="mx-3 text-gray-400">→</span>
              <span className="text-gray-700">{swap.alternative}</span>
            </div>
          </li>)}
        </ul>
      </section>}
      {/* Cook Now Button */}
      {!cooked && <button onClick={handleCookNow} className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-4 px-6 rounded-xl shadow-md transition-colors duration-200 mt-4">
        I Cooked This
      </button>}
    </main>
  </div>;
}