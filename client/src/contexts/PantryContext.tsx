import React, { useState, createContext, useContext, useEffect } from 'react';
import { PantryItem, ShoppingListItem, Recipe, Folder, UserSettings, IngredientEntry } from '../api/Types';
import { recipeApi } from '../api/Recipes';
import { folderApi } from '../api/Folder';
import { PantryItemApi } from '../api/PantryItem';
import { ingredientApi } from "../api/Ingredient";
import { shoppingListApi } from '../api/ShoppingList';

interface PantryContextType {
  recipes: Recipe[];
  fetchAllRecipes: () => void;
  addRecipe: (Recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (Recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  userSettings: UserSettings;
  updateUserSettings: (settings: UserSettings) => void;
  folders: Folder[];
  fetchAllFolders: () => void;
  addFolder: (folder: Omit<Folder, 'id'>) => Promise<void>;
  deleteFolder: (id: string) => void;
  updateFolder: (folder: Folder) => void;

  // pantry items
  pantryItems: PantryItem[];
  fetchAllPantryItems: () => void;
  updatePantryItem: (item: PantryItem) => void;
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
}

const PantryContext = createContext<PantryContextType | undefined>(undefined);
export function PantryProvider({
  children
}: {
  children: React.ReactNode;
}) {
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
    measurementUnit: 'metric'
  });

  const fetchAllFolders = async () => {
    try {
      const fetchedFolders = await folderApi.list();
      setFolders(fetchedFolders);
    } catch (err) {
      console.error('Fetch folders failed:', err);
    }
  };

  const addFolder = async (folder: Omit<Folder, 'id'>) => {
    // temporary folder for optimistic UI
    const tempFolder: Folder = {
      ...folder,
      id: `folder-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };

    setFolders(prev => [...prev, tempFolder]);

    try {
      const savedFolder = await folderApi.create(folder);

      // replace temp with the one from backend
      setFolders(prev =>
        prev.map(f => (f.id === tempFolder.id ? savedFolder : f))
      );
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

  const fetchAllPantryItems = async () => {
    try {
      const fetchedPantryItems = await PantryItemApi.list();
      setPantryItems(fetchedPantryItems);
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
      const savedItem = await PantryItemApi.create(item);

      // replace temp with the one from backend
      setPantryItems(prev =>
        prev.map(i => (i.id === tempItem.id ? savedItem : i))
      );
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

  const removePantryItem = (id: string) => {
    setPantryItems(prev => prev.filter(i => i.id !== id));
    PantryItemApi.delete(id);
  };

  // fetch ingredients with optional query
  const fetchAllIngredients = async (query: string | null) => {
    try {
      const fetchedIngredients = await ingredientApi.list(query || undefined);
      setIngredients(fetchedIngredients);
    } catch (err) {
      console.error('Fetch ingredients failed:', err);
    }
  };

  // shopping list item functions
  const fetchAllShoppingListItems = async () => {
    try {
      const fetchedItems = await shoppingListApi.list();
      setShoppingList(fetchedItems);
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
      const savedItem = await shoppingListApi.create(item);

      // replace temp with the one from backend
      setShoppingList(prev =>
        prev.map(i => (i.id === tempItem.id ? savedItem : i))
      );
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

  useEffect(() => {
    fetchAllFolders();
    fetchAllRecipes();
    fetchAllPantryItems();
    fetchAllShoppingListItems();
  }, []);

  return <PantryContext.Provider value={{
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
    addPantryItem,
    removePantryItem,
    fetchAllIngredients,
    ingredients,
    fetchAllShoppingListItems,
    updateShoppingListItem,
    addShoppingListItem,
    removeShoppingListItem
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
