import React from 'react';
import { Clock, ShoppingCart } from 'lucide-react';
interface RecipeCardProps {
  recipe: any;
  onSelect: () => void;
  readiness: 'ready' | 'missing-one';
  missingIngredient?: any;
}
export function RecipeCard({
  recipe,
  onSelect,
  readiness,
  missingIngredient
}: RecipeCardProps) {
  return <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200" onClick={onSelect}>
      <div className="flex h-full">
        <div className="w-1/3 h-32 md:h-40">
          <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
        </div>
        <div className="w-2/3 p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-gray-800">{recipe.name}</h3>
            <div className="flex items-center text-gray-500 text-sm mt-1">
              <Clock size={16} className="mr-1" />
              <span>{recipe.cookTime} mins</span>
            </div>
          </div>
          <div className="mt-3">
            {readiness === 'ready' ? <span className="bg-red-50 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
                Ready to Cook
              </span> : <div className="flex items-center">
                <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full mr-2">
                  Needs 1 item
                </span>
                <div className="flex items-center text-gray-600 text-xs">
                  <ShoppingCart size={14} className="mr-1" />
                  <span>{missingIngredient?.name}</span>
                </div>
              </div>}
          </div>
        </div>
      </div>
    </div>;
}