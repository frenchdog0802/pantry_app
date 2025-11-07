import React, { useState, createContext, useContext, useEffect } from 'react';
import { PantryItem, ShoppingListItem, Recipe, Folder, UserSettings, IngredientEntry, MealPlan } from '../api/types';
import { recipeApi } from '../api/recipes';
import { folderApi } from '../api/folder';
import { PantryItemApi } from '../api/pantryItem';
import { ingredientApi } from "../api/ingredient";
import { shoppingListApi } from '../api/shoppingList';
import { mealPlanApi } from '../api/mealPlan';

interface PantryContextType {
  queryPantryData: () => void;
  recipes: Recipe[];
  fetchAllRecipes: () => void;
  addRecipe: (Recipe: Recipe) => void;
  updateRecipe: (Recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  userSettings: UserSettings;
  updateUserSettings: (settings: UserSettings) => void;
  folders: Folder[];
  fetchAllFolders: () => void;
  addFolder: (folder: Folder) => Promise<void>;
  deleteFolder: (id: string) => void;
  updateFolder: (folder: Folder) => void;
  // createInitFolders: (folders: Folder[]) => void;

  // pantry items
  pantryItems: PantryItem[];
  fetchAllPantryItems: () => void;
  updatePantryItem: (item: PantryItem) => void;
  updatePantryItems: (items: PantryItem[]) => void;
  addPantryItem: (item: Omit<PantryItem, 'id'>) => void;
  removePantryItem?: (id: string) => void;

  // ingredients
  fetchAllIngredients: (query: string | null) => void;
  ingredients: IngredientEntry[];

  // shopping List
  shoppingList: ShoppingListItem[];
  fetchAllShoppingListItems: () => void;
  updateShoppingListItem: (item: ShoppingListItem) => void;
  addShoppingListItem: (item: Omit<ShoppingListItem, 'id'>) => void;
  removeShoppingListItem?: (id: string) => void;

  // meal plans
  mealPlan: MealPlan[];
  fetchAllMealPlans: () => void;
  addMealPlan: (mealPlan: MealPlan) => void;
  updateMealPlan: (mealPlan: MealPlan) => void;
  deleteMealPlan: (id: string) => void;
}

const PantryContext = createContext<PantryContextType | undefined>(undefined);
export function PantryProvider({
  children
}: {
  children: React.ReactNode;
}) {
  // meal plan state
  const [mealPlan, setMealPlan] = useState<MealPlan[]>([]);
  // ingredient state
  const [ingredients, setIngredients] = useState<IngredientEntry[]>([]);
  // folder state
  const [folders, setFolders] = useState<Folder[]>([]);
  // main state
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    name: '',
    language: 'english',
    measurement_unit: 'metric'
  });

  const fetchAllFolders = async () => {
    try {
      const fetchedFoldersResponse = await folderApi.list();
      if (fetchedFoldersResponse && fetchedFoldersResponse.data && fetchedFoldersResponse.success) {
        const fetchedFolders = fetchedFoldersResponse.data;
        setFolders(fetchedFolders);
      }
    } catch (err) {
      console.error('Fetch folders failed:', err);
    }
  };


  const addFolder = async (folder: Folder) => {
    const tempFolder: Folder = {
      ...folder
    };

    setFolders(prev => [...prev, tempFolder]);

    try {
      const savedFolderResponse = await folderApi.create(folder);
      if (savedFolderResponse && savedFolderResponse.data && savedFolderResponse.success) {
        // replace temp with the one from backend
        const savedFolder = savedFolderResponse.data;
        if (savedFolder) {
          setFolders(prev =>
            prev.map(f => (f.name === tempFolder.name ? savedFolder : f))
          );
        }
      }
    } catch (err) {
      console.error('Insert folder failed:', err);
      // rollback if needed
      setFolders(prev => prev.filter(f => f.id !== tempFolder.id));
    }
  };
  const deleteFolder = (id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    folderApi.delete(id);
  };

  const updateFolder = (folder: Folder) => {
    setFolders(prev => prev.map(f => f.id === folder.id ? folder : f));
    folderApi.update(folder.id, folder);
  };


  const fetchAllRecipes = async () => {
    try {
      const fetchedRecipesResponse = await recipeApi.list();
      if (fetchedRecipesResponse && fetchedRecipesResponse.data && fetchedRecipesResponse.success) {
        const fetchedRecipes = fetchedRecipesResponse.data;
        setRecipes(fetchedRecipes);
      }
    } catch (err) {
      console.error('Fetch recipes failed:', err);
    }
  }
  const addRecipe = async (recipe: Recipe) => {
    // temporary recipe for optimistic UI
    const tempRecipe: Recipe = {
      ...recipe,
    };

    setRecipes(prev => [...prev, tempRecipe]);

    try {
      const savedRecipeResponse = await recipeApi.create(recipe);
      if (savedRecipeResponse && savedRecipeResponse.data && savedRecipeResponse.success) {
        const savedRecipe = savedRecipeResponse.data;

        // replace temp with the one from backend
        setRecipes(prev =>
          prev.map(r => (r.id === tempRecipe.id ? savedRecipe : r))
        );
      }
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

  const fetchAllPantryItems = async () => {
    try {
      const fetchedPantryItemsResponse = await PantryItemApi.list();
      if (fetchedPantryItemsResponse && fetchedPantryItemsResponse.data && fetchedPantryItemsResponse.success) {
        const fetchedPantryItems = fetchedPantryItemsResponse.data;
        setPantryItems(fetchedPantryItems);
      }
    } catch (err) {
      console.error('Fetch pantry items failed:', err);
    }
  };
  const addPantryItem = async (item: Omit<PantryItem, 'id'>) => {
    // temporary item for optimistic UI
    const tempItem: PantryItem = {
      ...item,
      id: `pantry-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };

    setPantryItems(prev => [...prev, tempItem]);

    try {
      const savedItemResponse = await PantryItemApi.create(item);
      if (savedItemResponse && savedItemResponse.data && savedItemResponse.success) {
        const savedItem = savedItemResponse.data;

        // replace temp with the one from backend
        setPantryItems(prev =>
          prev.map(i => (i.id === tempItem.id ? savedItem : i))
        );
      }
    } catch (err) {
      console.error('Insert pantry item failed:', err);
      // rollback if needed
      setPantryItems(prev => prev.filter(i => i.id !== tempItem.id));
    }
  };
  const updatePantryItem = (item: PantryItem) => {
    setPantryItems(prev => prev.map(i => i.id === item.id ? item : i));
    PantryItemApi.update(item.id, item);
  };
  const updatePantryItems = (items: PantryItem[]) => {
    setPantryItems(items);
    PantryItemApi.updateMany(items);
  };

  const removePantryItem = (id: string) => {
    setPantryItems(prev => prev.filter(i => i.id !== id));
    PantryItemApi.delete(id);
  };

  // fetch ingredients with optional query
  const fetchAllIngredients = async (query: string | null) => {
    try {
      const fetchedIngredientsResponse = await ingredientApi.list(query || undefined);
      if (fetchedIngredientsResponse && fetchedIngredientsResponse.data && fetchedIngredientsResponse.success) {
        const fetchedIngredients = fetchedIngredientsResponse.data;
        setIngredients(fetchedIngredients);
      }
    } catch (err) {
      console.error('Fetch ingredients failed:', err);
    }
  };

  // shopping list item functions
  const fetchAllShoppingListItems = async () => {
    try {
      const fetchedItemsResponse = await shoppingListApi.list();
      if (fetchedItemsResponse && fetchedItemsResponse.data && fetchedItemsResponse.success) {
        const fetchedItems = fetchedItemsResponse.data;
        setShoppingList(fetchedItems);
      }
    } catch (err) {
      console.error('Fetch shopping list items failed:', err);
    }
  };
  const updateShoppingListItem = (item: ShoppingListItem) => {
    setShoppingList(prev => prev.map(i => i.id === item.id ? item : i));
    shoppingListApi.update(item.id, item);
  };

  const addShoppingListItem = async (item: Omit<ShoppingListItem, 'id'>) => {
    // temporary item for optimistic UI
    const tempItem: ShoppingListItem = {
      ...item,
      id: `shopping-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      checked: false
    };

    setShoppingList(prev => [...prev, tempItem]);

    try {
      const savedItemResponse = await shoppingListApi.create(item);
      if (savedItemResponse && savedItemResponse.data && savedItemResponse.success) {
        const savedItem = savedItemResponse.data;

        // replace temp with the one from backend
        setShoppingList(prev =>
          prev.map(i => (i.id === tempItem.id ? savedItem : i))
        );
      } else {
        // rollback if response is invalid
        setShoppingList(prev => prev.filter(i => i.id !== tempItem.id));
      }
    } catch (err) {
      console.error('Insert shopping list item failed:', err);
      // rollback if needed
      setShoppingList(prev => prev.filter(i => i.id !== tempItem.id));
    }

  };
  const removeShoppingListItem = (id: string) => {
    setShoppingList(prev => prev.filter(i => i.id !== id));
    shoppingListApi.delete(id);
  };

  // meal plan functions
  const fetchAllMealPlans = async () => {
    try {
      const fetchedMealPlansResponse = await mealPlanApi.list();
      if (fetchedMealPlansResponse && fetchedMealPlansResponse.data && fetchedMealPlansResponse.success) {
        const fetchedMealPlans = fetchedMealPlansResponse.data;
        setMealPlan(fetchedMealPlans);
      }
    } catch (err) {
      console.error('Fetch meal plans failed:', err);
    }
  };
  const addMealPlan = async (mealPlan: MealPlan) => {
    // temporary meal plan for optimistic UI
    const tempMealPlan: MealPlan = {
      ...mealPlan,
    };

    setMealPlan(prev => [...prev, tempMealPlan]);

    try {
      const savedMealPlanResponse = await mealPlanApi.create(mealPlan);
      if (savedMealPlanResponse && savedMealPlanResponse.data && savedMealPlanResponse.success) {
        const savedMealPlan = savedMealPlanResponse.data;

        // replace temp with the one from backend
        setMealPlan(prev =>
          prev.map(m => (m.id === tempMealPlan.id ? savedMealPlan : m))
        );
      } else {
        // rollback if response is invalid
        setMealPlan(prev => prev.filter(m => m.id !== tempMealPlan.id));
      }
    } catch (err) {
      console.error('Insert meal plan failed:', err);
      // rollback if needed
      setMealPlan(prev => prev.filter(m => m.id !== tempMealPlan.id));
    }
  };
  const updateMealPlan = (mealPlan: MealPlan) => {
    setMealPlan(prev => prev.map(m => m.id === mealPlan.id ? mealPlan : m));
    mealPlanApi.update(mealPlan.id, mealPlan);
  };
  const deleteMealPlan = (id: string) => {
    setMealPlan(prev => prev.filter(m => m.id !== id));
    mealPlanApi.delete(id);
  };

  const queryPantryData = () => {
    fetchAllFolders();
    fetchAllRecipes();
    fetchAllPantryItems();
    fetchAllShoppingListItems();
    fetchAllMealPlans();
  };



  return <PantryContext.Provider value={{
    queryPantryData,
    recipes,
    pantryItems,
    shoppingList,
    addRecipe,
    fetchAllRecipes,
    updateRecipe,
    deleteRecipe,
    userSettings,
    updateUserSettings,
    folders,
    fetchAllFolders,
    addFolder,
    deleteFolder,
    updateFolder,
    fetchAllPantryItems,
    updatePantryItem,
    updatePantryItems,
    addPantryItem,
    removePantryItem,
    fetchAllIngredients,
    ingredients,
    fetchAllShoppingListItems,
    updateShoppingListItem,
    addShoppingListItem,
    removeShoppingListItem,
    mealPlan,
    fetchAllMealPlans,
    addMealPlan,
    updateMealPlan,
    deleteMealPlan
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
