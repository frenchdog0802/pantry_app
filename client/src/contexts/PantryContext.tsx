import React, { useState, createContext, useContext } from 'react';
import { initialPantryItems } from '../utils/pantryData';
import { PantryItem, CookingHistoryItem, ShoppingListItem, Recipe, RecipeSuggestion } from '../api/types';
import { recipeSuggestions } from '../utils/recipeData';
import { recipeApi } from '../api/recipes';
interface UserSettings {
  name: string;
  language: string;
  measurementUnit: string;
}
interface PantryContextType {
  recipeSuggestions: RecipeSuggestion[];
  pantryItems: PantryItem[];
  cookingHistory: CookingHistoryItem[];
  shoppingList: ShoppingListItem[];
  recipes: Recipe[];
  updatePantryItems: (items: PantryItem[]) => void;
  addToCookingHistory: (recipe: any) => void;
  addToShoppingList: (item: Omit<ShoppingListItem, 'id' | 'purchased'>) => void;
  updateShoppingList: (items: ShoppingListItem[]) => void;
  fetchAllRecipes: () => void;
  addRecipe: (Recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (Recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  userSettings: UserSettings;
  updateUserSettings: (settings: UserSettings) => void;
}

const PantryContext = createContext<PantryContextType | undefined>(undefined);
export function PantryProvider({
  children
}: {
  children: React.ReactNode;
}) {

  const [pantryItems, setPantryItems] = useState<PantryItem[]>(initialPantryItems);
  const [cookingHistory, setCookingHistory] = useState<CookingHistoryItem[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [recipeSuggestion, setRecipeSuggestion] = useState<RecipeSuggestion[]>(recipeSuggestions);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    name: '',
    language: 'english',
    measurementUnit: 'metric'
  });
  const updatePantryItems = (items: PantryItem[]) => {
    setPantryItems(items);
  };
  const addToCookingHistory = (recipe: any) => {
    const historyItem: CookingHistoryItem = {
      id: `history-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      date: recipe.date || new Date().toISOString().split('T')[0],
      recipeId: recipe.id,
      recipeName: recipe.name,
      type: recipe.type || 'dinner',
      image: recipe.image || null
    };
    setCookingHistory(prev => [...prev, historyItem]);
  };
  const addToShoppingList = (item: Omit<ShoppingListItem, 'id' | 'purchased'>) => {
    const newItem = {
      ...item,
      id: `shopping-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      purchased: false
    };
    setShoppingList(prev => [...prev, newItem]);
  };
  const updateShoppingList = (items: ShoppingListItem[]) => {
    setShoppingList(items);
  };

  const fetchAllRecipes = async () => {
    try {
      const fetchedRecipes = await recipeApi.list();
      setRecipes(fetchedRecipes);
    } catch (err) {
      console.error('Fetch recipes failed:', err);
    }
  }
  const addRecipe = async (recipe: Omit<Recipe, 'id'>) => {
    // temporary recipe for optimistic UI
    const tempRecipe: Recipe = {
      ...recipe,
      id: `recipe-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      image: null // todo uplodad to S3 and get URL
    };

    setRecipes(prev => [...prev, tempRecipe]);

    try {
      const savedRecipe = await recipeApi.create(recipe);

      // replace temp with the one from backend
      setRecipes(prev =>
        prev.map(r => (r.id === tempRecipe.id ? savedRecipe : r))
      );
    } catch (err) {
      console.error('Insert recipe failed:', err);
      // rollback if needed
      setRecipes(prev => prev.filter(r => r.id !== tempRecipe.id));
    }
  };
  const updateRecipe = (recipe: Recipe) => {
    setRecipes(prev => prev.map(r => r.id === recipe.id ? recipe : r));
  };
  const deleteRecipe = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    recipeApi.delete(id);
  };
  const updateUserSettings = (settings: UserSettings) => {
    setUserSettings(settings);
  };

  return <PantryContext.Provider value={{
    recipes,
    pantryItems,
    cookingHistory,
    shoppingList,
    recipeSuggestions,
    updatePantryItems,
    addToCookingHistory,
    addToShoppingList,
    updateShoppingList,
    addRecipe,
    fetchAllRecipes,
    updateRecipe,
    deleteRecipe,
    userSettings,
    updateUserSettings
  }}>
    {children}
  </PantryContext.Provider>;
}
export function usePantry() {
  const context = useContext(PantryContext);
  if (context === undefined) {
    throw new Error('usePantry must be used within a PantryProvider');
  }
  return context;
}

export { initialPantryItems };
