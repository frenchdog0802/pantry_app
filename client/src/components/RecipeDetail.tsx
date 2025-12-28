import { useState } from 'react';
import { ArrowLeftIcon, CheckCircleIcon, ShoppingCartIcon } from 'lucide-react';
import { usePantry } from '../contexts/pantryContext';
import { IngredientEntry, Recipe } from '../api/types';
interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
}
export function RecipeDetail({
  recipe,
  onBack
}: RecipeDetailProps) {
  const {
    pantryItems,
    updatePantryItems
  } = usePantry();
  const [cooked, setCooked] = useState(false);
  const checkIngredientAvailability = (ingredient: IngredientEntry) => {
    const pantryItem = pantryItems.find(item => item.name.toLowerCase() === ingredient.name.toLowerCase());
    if (!pantryItem) return 'missing';
    return 'available';
  };
  return <div className="flex flex-col w-full min-h-screen bg-gray-50">
    <div className="flex-1 overflow-y-auto pb-20">
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
        <img src={recipe.image.url} alt={recipe.meal_name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h2 className="text-2xl font-bold text-white">{recipe.meal_name}</h2>
          <p className="text-white/90">
            {/* {recipe.cookTime} mins • {recipe.difficulty} */} 100 min • Medium
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
            {recipe.ingredients.map((ingredient: any, index: number) => {
              const availability = checkIngredientAvailability(ingredient);
              return <li key={index} className={`flex justify-between items-center p-3 rounded-lg ${availability === 'available' ? 'bg-red-50 border border-red-100' : 'bg-gray-50 border border-gray-100'}`}>
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
            {recipe.instructions.map((step: any, index: number) => <li key={index} className="flex">
              <div className="bg-red-100 rounded-full w-8 h-8 flex items-center justify-center text-red-700 font-semibold mr-4 flex-shrink-0 mt-0.5">
                {index + 1}
              </div>
              <p className="text-gray-700">{step}</p>
            </li>)}
          </ol>
        </section>
      </main>
    </div></div>;
}