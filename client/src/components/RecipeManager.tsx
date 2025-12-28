import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeftIcon, PlusIcon, TrashIcon, SearchIcon, CalendarIcon, EditIcon, XIcon, ImageIcon, PackageIcon, FolderIcon, ChevronRightIcon, HomeIcon, MoreVerticalIcon, FolderPlusIcon, PencilIcon, AlertCircleIcon } from 'lucide-react';
import { usePantry } from '../contexts/pantryContext';
import { IngredientEntry, Folder, Recipe } from '../api/types';
import { ImageUploadApi } from '../api/ImageUploader';
import { compressImage } from '../utils/imageHelper';


interface RecipeManagerProps {
  onBack: () => void;
}

export function RecipeManager({
  onBack
}: RecipeManagerProps) {
  const {
    recipes: storedRecipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    fetchAllRecipes,
    fetchAllFolders,
    addFolder,
    deleteFolder,
    updateFolder,
    folders: savedFolders,
    ingredients,
    fetchAllIngredients,
  } = usePantry();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  // Folders state
  const [folders, setFolders] = useState<Folder[]>(savedFolders);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [showFolderActions, setShowFolderActions] = useState<string | null>(null);
  const [showDeleteFolderConfirmation, setShowDeleteFolderConfirmation] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>(storedRecipes);
  const [itemSearchQuery, setItemSearchQuery] = useState<string>('');
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);
  const ingredientDropdownRef = useRef<HTMLDivElement>(null);
  const [newRecipeError, setNewRecipeError] = useState<string>('');
  const [newRecipe, setNewRecipe] = useState<Recipe>({
    id: '',
    meal_name: '',
    ingredients: [{
      name: '',
      quantity: 1,
      unit: '',
    }],
    image: null as any,
    folder_id: '' as string,
    instructions: [] as string[],
  });
  useEffect(() => {
    fetchAllRecipes();
    fetchAllFolders();
    fetchAllIngredients(null); // Fetch all ingredients initially to enable local filtering
  }, []);

  useEffect(() => {
    // If no folders exist, initialize default ones
    if (savedFolders.length === 0) {
      initializeDefaultFolders();
    }
  }, [savedFolders]);


  // Initialize default folders
  const initializeDefaultFolders = () => {
    const defaultFolders = [{
      id: 'uncategorized',
      name: 'Uncategorized',
      icon: 'FolderIcon',
      createdAt: Date.now()
    }, {
      id: 'favorites',
      name: 'Favorites',
      icon: 'FolderIcon',
      createdAt: Date.now()
    }, {
      id: 'breakfast',
      name: 'Breakfast',
      icon: 'FolderIcon',
      createdAt: Date.now()
    }, {
      id: 'lunch',
      name: 'Lunch',
      icon: 'FolderIcon',
      createdAt: Date.now()
    }, {
      id: 'dinner',
      name: 'Dinner',
      icon: 'FolderIcon',
      createdAt: Date.now()
    }];

    defaultFolders.forEach(folder => {
      addFolder(folder);
    });
    setFolders(defaultFolders);

  };



  // Filter recipes based on search query
  const filteredRecipes = recipes.filter(recipe => {
    if (currentFolder && recipe.folder_id !== currentFolder.id) {
      return false;
    }
    const matchesSearch = recipe.ingredients && recipe.ingredients.some(item => item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) || recipe.meal_name && recipe.meal_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Handle creating a new folder
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: Folder = {
      id: `folder-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: newFolderName.trim(),
      icon: 'FolderIcon',
    };
    setFolders([...(folders ?? []), newFolder]);
    setNewFolderName('');
    setShowAddFolder(false);
    addFolder(newFolder);
  };
  // Handle updating a folder
  const handleUpdateFolder = () => {
    if (!editingFolder || !newFolderName.trim()) return;
    const updatedFolders = (folders ?? []).map(folder => folder.id === editingFolder.id ? {
      ...folder,
      name: newFolderName.trim()
    } : folder);
    setFolders(updatedFolders);
    setEditingFolder(null);
    setNewFolderName('');
    updateFolder({ ...editingFolder, name: newFolderName.trim() });
  };
  // Handle deleting a folder
  const handleDeleteFolder = () => {
    if (!folderToDelete) return;
    // Move all recipes in this folder to Uncategorized
    recipes.filter(recipe => recipe.folder_id === folderToDelete.id).forEach(recipe => {
      updateRecipe({
        ...recipe,
        folder_id: 'uncategorized'
      });
    });
    setRecipes(prev => prev.map(recipe => recipe.folder_id === folderToDelete.id ? {
      ...recipe,
      folder_id: 'uncategorized'
    } : recipe));
    // Remove the folder
    setFolders((folders ?? []).filter(folder => folder.id !== folderToDelete.id));
    setFolderToDelete(null);
    setShowDeleteFolderConfirmation(false);
    // If current folder is deleted, go back to folder list
    if (currentFolder && currentFolder.id === folderToDelete.id) {
      setCurrentFolder(null);
    }
    deleteFolder(folderToDelete.id);
  };

  const handleSelectIngredient = (pantryItem: any, index: number) => {
    if (isEditing && selectedRecipe) {
      const updatedItems = [...selectedRecipe.ingredients];
      updatedItems[index] = {
        ...updatedItems[index],
        name: pantryItem.name,
        unit: pantryItem.default_unit
      };
      setSelectedRecipe({
        ...selectedRecipe,
        ingredients: updatedItems
      });
    } else {
      const updatedItems = [...newRecipe.ingredients];
      updatedItems[index] = {
        ...updatedItems[index],
        name: pantryItem.name,
        unit: pantryItem.default_unit
      };
      setNewRecipe({
        ...newRecipe,
        ingredients: updatedItems
      });
    }
    setShowIngredientDropdown(false);
    setActiveItemIndex(null);
    setItemSearchQuery('');
  };


  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);

      const res = await ImageUploadApi.upload(compressed);

      if (!res.success || !res.data) {
        console.error("Upload failed", res.message);
        return;
      }

      const image_url = res.data.image_url; // Cloudinary URL

      if (isEditing && selectedRecipe) {
        setSelectedRecipe({
          ...selectedRecipe,
          image: {
            url: image_url,
            public_id: res.data.public_id,
          }
        });
      } else {
        setNewRecipe({
          ...newRecipe,
          image: {
            url: image_url,
            public_id: res.data.public_id,
          }
        });
      }
    } catch (err) {
      console.error("Image upload error:", err);
    }
  };

  // handle image removal
  const handleImageRemove = async (publicId: string) => {
    try {
      const res = await ImageUploadApi.delete(publicId);
      console.log("Image deletion response:", res);
      if (res.success) {
        if (isEditing && selectedRecipe) {
          setSelectedRecipe({
            ...selectedRecipe,
            image: null as any,
          });
        } else {
          setNewRecipe({
            ...newRecipe,
            image: null as any,
          });
        }
      }
    } catch (err) {
      console.error("Image deletion error:", err);
    }
  };

  // Update Recipe item
  const handleUpdateRecipeItem = (index: number, field: string, value: any) => {
    if (isEditing && selectedRecipe) {
      const updatedItems = [...selectedRecipe.ingredients];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: field === 'price' || field === 'quantity' ? parseFloat(value) || 0 : value
      };
      setSelectedRecipe({
        ...selectedRecipe,
        ingredients: updatedItems,
      });
    } else {
      const updatedItems = [...newRecipe.ingredients];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: field === 'quantity' ? parseFloat(value) || 0 : value
      };
      setNewRecipe({
        ...newRecipe,
        ingredients: updatedItems,
      });
    }
  };

  // Add a new item to the Recipe
  const handleAddRecipeItem = () => {
    if (isEditing && selectedRecipe) {
      setSelectedRecipe({
        ...selectedRecipe,
        ingredients: [...selectedRecipe.ingredients, {
          name: '',
          quantity: 1,
          unit: ''
        }]
      });
    } else {
      setNewRecipe({
        ...newRecipe,
        ingredients: [...newRecipe.ingredients, {
          name: '',
          quantity: 1,
          unit: ''
        }]
      });
    }
  };


  // Remove recipe item
  const handleRemoveRecipeItem = (index: number) => {
    if (isEditing && selectedRecipe) {
      const updatedIngredients = selectedRecipe.ingredients.filter((_, i) => i !== index);
      setSelectedRecipe({
        ...selectedRecipe,
        ingredients: updatedIngredients,
      });
    } else {
      const updatedIngredients = newRecipe.ingredients.filter((_, i) => i !== index);
      setNewRecipe({
        ...newRecipe,
        ingredients: updatedIngredients,
      });
    }
  };

  // Save recipe
  const handleSaveRecipe = () => {
    if (isEditing && selectedRecipe) {
      if (selectedRecipe.ingredients.some(ingredient => !ingredient.name.trim())) {
        setNewRecipeError('Ingredient names cannot be empty.');
        return;
      }
      updateRecipe(selectedRecipe);
      setRecipes(prev => prev.map(r => r.id === selectedRecipe.id ? selectedRecipe : r));
      setSelectedRecipe(null);
      setIsEditing(false);
    } else {
      if (newRecipe.ingredients.some(ingredient => !ingredient.name.trim())) {
        setNewRecipeError('Ingredient names cannot be empty.');
        return;
      }
      // Skip pantry availability validation per request
      const recipeToAdd = {
        ...newRecipe,
        folder_id: newRecipe.folder_id || (currentFolder ? currentFolder.id : 'uncategorized')
      };
      addRecipe(recipeToAdd);
      setRecipes(prev => [...prev, recipeToAdd]);
      setNewRecipe({
        id: '',
        meal_name: '',
        ingredients: [],
        image: {
          url: '',
          public_id: '',
        },
        folder_id: currentFolder ? currentFolder.id : 'uncategorized',
        instructions: [] as string[],
      });
      setNewRecipeError('');
      setShowAddRecipe(false);
    }
  };

  const handleDeleteRecipe = (recipeId: string) => {
    setRecipes(prev => prev.filter(r => r.id !== recipeId));
    deleteRecipe(recipeId);
  };

  const getFilteredPantryItems = (query: string) => {
    // Removed fetchAllIngredients call to prevent infinite loop; filter locally after initial fetch
    if (!query.trim()) return ingredients.slice(0, 10); // Show first 10 if no query
    return ingredients.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
  };

  // Add items from recipe to pantry
  const handleAddItemsToPantry = (ingredients: IngredientEntry[]) => {
    // Determine which items already exist and should be updated vs created
    const nameToExisting = new Map(ingredients.map(p => [p.name.toLowerCase(), p]));

    const itemsToUpdate = [] as typeof ingredients;
    const itemsToCreate = [] as Array<Omit<typeof ingredients[number], 'id'>>;

    ingredients.forEach(item => {
      const key = item.name.toLowerCase();
      const existing = nameToExisting.get(key);
      if (existing) {
        itemsToUpdate.push({
          ...existing,
        });
      } else if (item.name.trim()) {
        itemsToCreate.push({
          name: item.name,
          default_unit: item.default_unit || '',
        });
      }
    });
  };


  // Handle starting to add a recipe from a folder
  const handleAddRecipeInFolder = (folder: Folder) => {
    setNewRecipe({
      ...newRecipe,
      folder_id: folder.id
    });
    setShowAddRecipe(true);
  };

  return <div className="flex flex-col w-full min-h-screen bg-gray-50">
    <div className="flex-1 overflow-y-auto pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-5 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Go back">
            <ArrowLeftIcon size={24} />
          </button>
          <h1 className="text-xl font-bold">Recipe Manager</h1>
          <div className="w-10"></div> {/* For layout balance */}
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 container mx-auto p-5">
        {!showAddRecipe && !selectedRecipe ? <>
          {/* Breadcrumb Navigation */}
          <div className="flex items-center mb-4 text-sm">
            <button onClick={() => setCurrentFolder(null)} className="flex items-center text-gray-600 hover:text-gray-900">
              <HomeIcon size={16} className="mr-1" />
              <span>Categories</span>
            </button>
            {currentFolder && <>
              <ChevronRightIcon size={16} className="mx-2 text-gray-400" />
              <span className="text-gray-800 font-medium">
                {currentFolder.name}
              </span>
            </>}
          </div>
          {/* Folder View */}
          {!currentFolder ? <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Recipe Categories
              </h2>
              <button onClick={() => {
                setNewFolderName('');
                setShowAddFolder(true);
              }} className="flex items-center text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-100 transition-colors">
                <FolderPlusIcon size={16} className="mr-1" />
                New Category
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {(folders ?? []).map(folder => <div key={folder.id} className="relative bg-white rounded-xl border border-gray-200 shadow-sm  hover:shadow-md transition-shadow">
                <div className="p-4 cursor-pointer" onClick={() => setCurrentFolder(folder)}>
                  <div className="flex items-center mb-2">
                    <FolderIcon size={20} className="text-amber-500 mr-2" />
                    <h3 className="font-medium text-gray-800">
                      {folder.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    {recipes.filter(r => r.folder_id === folder.id).length}{' '}
                    recipes
                  </p>
                </div>
                {/* Folder actions */}
                <div className="absolute top-2 right-2">
                  <button onClick={e => {
                    e.stopPropagation();
                    setShowFolderActions(showFolderActions === folder.id ? null : folder.id);
                  }} className="p-1 rounded-full hover:bg-gray-100">
                    <MoreVerticalIcon size={16} className="text-gray-500" />
                  </button>
                  {showFolderActions === folder.id && <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button onClick={e => {
                      e.stopPropagation();
                      setEditingFolder(folder);
                      setNewFolderName(folder.name);
                      setShowFolderActions(null);
                    }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center" disabled={folder.id === 'uncategorized'}>
                      <PencilIcon size={14} className="mr-2" />
                      Rename
                    </button>
                    <button onClick={e => {
                      e.stopPropagation();
                      handleAddRecipeInFolder(folder);
                      setShowFolderActions(null);
                    }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                      <PlusIcon size={14} className="mr-2" />
                      Add Recipe
                    </button>
                    {folder.id !== 'uncategorized' && <button onClick={e => {
                      e.stopPropagation();
                      setFolderToDelete(folder);
                      setShowDeleteFolderConfirmation(true);
                      setShowFolderActions(null);
                    }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center">
                      <TrashIcon size={14} className="mr-2" />
                      Delete
                    </button>}
                  </div>}
                </div>
                {/* Quick add recipe button */}
                <div className="absolute bottom-2 right-2">
                  <button onClick={e => {
                    e.stopPropagation();
                    handleAddRecipeInFolder(folder);
                  }} className="p-1 rounded-full bg-red-50 hover:bg-red-100 text-red-600" aria-label="Add recipe">
                    <PlusIcon size={16} />
                  </button>
                </div>
              </div>)}
            </div>
          </div> : <>
            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon size={18} className="text-gray-400" />
              </div>
              <input type="text" placeholder="Search recipes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            </div>
            {/* Add New Recipe Button */}
            <button onClick={() => {
              setNewRecipe({
                ...newRecipe,
                folder_id: currentFolder.id
              });
              setShowAddRecipe(true);
            }} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-xl mb-6 shadow-sm transition-colors">
              <PlusIcon size={18} />
              <span>Add New Recipe</span>
            </button>
            {/* Recipes List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {filteredRecipes.length === 0 ? <div className="p-6 text-center">
                <p className="text-gray-500">No recipes found</p>
                {searchQuery && <p className="text-gray-400 text-sm mt-1">
                  Try a different search term
                </p>}
              </div> : <ul className="divide-y divide-gray-100">
                {filteredRecipes.map(recipe => <li key={recipe.id} className="p-4">
                  <div className="flex justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => {
                      setSelectedRecipe(recipe);
                      setIsEditing(false);
                    }}>
                      <div className="flex items-center mb-1">
                        {recipe.image && <ImageIcon size={16} className="ml-2 text-gray-400" />}
                      </div>
                      {/* Fixed: Added missing meal_name display */}
                      <h3 className="font-medium text-gray-800 mb-1">
                        {recipe.meal_name}
                      </h3>
                      <p className="text-gray-500 text-xs mt-1">
                        {recipe.ingredients.length} ingredient
                        {recipe.ingredients.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button onClick={() => {
                        setSelectedRecipe(recipe);
                        setIsEditing(true);
                      }} className="p-1.5 rounded-full hover:bg-blue-50 text-blue-600" aria-label="Edit recipe">
                        <EditIcon size={18} />
                      </button>
                      <button onClick={() => handleDeleteRecipe(recipe.id)} className="p-1.5 rounded-full hover:bg-red-50 text-red-500" aria-label="Delete recipe">
                        <TrashIcon size={18} />
                      </button>
                    </div>
                  </div>
                </li>)}
              </ul>}
            </div>
          </>}
        </> : selectedRecipe ?
          // Recipe Detail View
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">
                {isEditing ? 'Edit Recipe' : 'Recipe Details'}
              </h2>
              <button onClick={() => {
                setSelectedRecipe(null);
                setIsEditing(false);
              }} className="p-1 rounded-full hover:bg-gray-200" aria-label="Close">
                <XIcon size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              {isEditing ?
                // Edit Recipe Form
                <div className="space-y-4">
                  <div>
                    <label htmlFor="meal-name-edit" className="block text-gray-700 mb-2">
                      Meal Name
                    </label>
                    <input
                      id="meal-name-edit"
                      type="text"
                      value={selectedRecipe.meal_name}
                      onChange={e => setSelectedRecipe({ ...selectedRecipe, meal_name: e.target.value })}
                      placeholder="Enter what you cooked"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  {/* Recipe Image */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Meal Photo{' '}
                      (optional)
                    </label>
                    {!selectedRecipe.image ? <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                      <ImageIcon size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500 mb-2">
                        Add a photo of your meal
                      </p>
                      <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg border border-gray-200 inline-block transition-colors">
                        Upload Image
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div> : <div className="relative rounded-xl overflow-hidden h-40">
                      <img src={selectedRecipe.image.url} alt="Meal" className="w-full h-full object-cover" />
                      <button onClick={() => handleImageRemove(selectedRecipe.image.public_id)} className="absolute top-2 right-2 bg-white/80 p-1 rounded-full hover:bg-white text-red-500" aria-label="Remove image">
                        <XIcon size={20} />
                      </button>
                    </div>}
                  </div>
                  {/* Items List */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-gray-700 text-sm font-medium">
                        {selectedRecipe ? 'Ingredients' : 'Items'}
                      </label>
                      <button onClick={handleAddRecipeItem} className="text-sm flex items-center text-red-600 hover:text-red-700">
                        <PlusIcon size={16} className="mr-1" />
                        Add {selectedRecipe ? 'Ingredient' : 'Item'}
                      </button>
                    </div>
                    {selectedRecipe.ingredients.map((item: any, index: number) => <div key={index} className="flex gap-1.5 items-center mb-2">
                      <div className="flex-1 min-w-0 relative" ref={activeItemIndex === index ? ingredientDropdownRef : null}>
                        <div className="relative">
                          <input type="text" value={item.name} onChange={e => {
                            handleUpdateRecipeItem(index, 'name', e.target.value);
                            setItemSearchQuery(e.target.value);
                            setActiveItemIndex(index);
                            setShowIngredientDropdown(true);
                          }} onFocus={() => {
                            setActiveItemIndex(index);
                            setShowIngredientDropdown(true);
                            setItemSearchQuery(item.name);
                          }} placeholder={selectedRecipe ? 'Search ingredient...' : 'Search item...'} className="w-full p-2 pr-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                          <SearchIcon size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Dropdown Menu */}
                        {showIngredientDropdown && activeItemIndex === index && <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {getFilteredPantryItems(itemSearchQuery).length > 0 ? getFilteredPantryItems(itemSearchQuery).map(pantryItem => <button key={pantryItem.name} type="button" onClick={() => handleSelectIngredient(pantryItem, index)} className="w-full text-left px-3 py-2 hover:bg-red-50 transition-colors text-sm border-b border-gray-100 last:border-b-0">
                            <div className="font-medium text-gray-800 capitalize">
                              {pantryItem.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {pantryItem.default_unit}
                            </div>
                          </button>) : <div></div>}
                        </div>}
                      </div>

                      <input type="number" min="1" value={item.quantity} onChange={e => handleUpdateRecipeItem(index, 'quantity', e.target.value)} className="w-16 p-2 border border-gray-200 rounded-lg" />
                      <input type="text" value={item.unit} onChange={e => handleUpdateRecipeItem(index, 'unit', e.target.value)} placeholder="Unit" className="w-16 p-2 border border-gray-200 rounded-lg" />
                      <button onClick={() => handleRemoveRecipeItem(index)} className="p-1 rounded-full hover:bg-red-50 text-red-500">
                        <TrashIcon size={16} />
                      </button>
                    </div>)}
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button onClick={() => {
                      setSelectedRecipe(null);
                      setIsEditing(false);
                    }} className="w-1/2 bg-gray-100 text-gray-700 py-2 rounded-lg">
                      Cancel
                    </button>
                    <button onClick={handleSaveRecipe} className="w-1/2 bg-red-600 text-white py-2 rounded-lg">
                      Save Changes
                    </button>
                  </div>
                </div> :
                // View Recipe Details
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold text-xl text-gray-800">
                        {selectedRecipe.meal_name}
                      </h3>
                      {/* Fixed: Removed empty <p>&nbsp;</p> */}
                    </div>
                  </div>
                  {selectedRecipe.image && <div className="rounded-xl overflow-hidden h-40 my-4">
                    <img src={selectedRecipe.image.url} alt="Meal" className="w-full h-full object-cover" />
                  </div>}
                  <div className="border-t border-b border-gray-100 py-4">
                    <h4 className="font-medium text-gray-700 mb-2">
                      Ingredients
                    </h4>
                    <ul className="space-y-2">
                      {selectedRecipe.ingredients.map((item, index) => <li key={index} className="flex justify-between">
                        <div>
                          <span className="text-gray-800">{item.name}</span>
                          <span className="text-gray-500 text-sm ml-2">
                            ({item.quantity} {item.unit})
                          </span>
                        </div>
                      </li>)}
                    </ul>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button onClick={() => setIsEditing(true)} className="w-1/2 bg-blue-50 text-blue-600 border border-blue-100 py-2 rounded-lg flex items-center justify-center">
                      <EditIcon size={16} className="mr-1" />
                      Edit Recipe
                    </button>
                    <button
                      onClick={() =>
                        handleAddItemsToPantry(
                          selectedRecipe.ingredients.map((ingredient, idx) => ({
                            id: `ingredient-${idx}-${Date.now()}`,
                            name: ingredient.name,
                            default_unit: ingredient.unit || '',
                          }))
                        )
                      }
                      className="w-1/2 bg-green-50 text-green-600 border border-green-100 py-2 rounded-lg flex items-center justify-center"
                    >
                      <PackageIcon size={16} className="mr-1" />
                      Add to Pantry
                    </button>
                  </div>
                </div>}
            </div>
          </div> :
          // Add New Recipe Form
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">Add New Recipe</h2>
              <button onClick={() => setShowAddRecipe(false)} className="p-1 rounded-full hover:bg-gray-200" aria-label="Close">
                <XIcon size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="meal-name" className="block text-gray-700 mb-2">
                    Meal Name
                  </label>
                  <input type="text" id="meal-name" value={newRecipe.meal_name} onChange={e => setNewRecipe({ ...newRecipe, meal_name: e.target.value })} placeholder="Enter what you cooked" className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                </div>
                {/* Image Upload Section */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Recipe Image (optional)
                  </label>
                  {!newRecipe.image ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                      <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500 mb-2">Add a photo of your Recipe</p>
                      <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg border border-gray-200 inline-block transition-colors">
                        Upload Image
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden aspect-[4/3]">
                      <img
                        src={newRecipe.image.url}
                        alt="Recipe photo"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />

                      <button
                        onClick={() => handleImageRemove(newRecipe.image!.public_id)}
                        className="absolute top-2 right-2 bg-white/80 p-1 rounded-full hover:bg-white text-red-500"
                        aria-label="Remove image"
                      >
                        <XIcon size={20} />
                      </button>
                    </div>
                  )}
                </div>
                {/* Items List */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-700 text-sm font-medium">
                      Items
                    </label>
                    <button onClick={handleAddRecipeItem} className="text-sm flex items-center text-red-600 hover:text-red-700">
                      <PlusIcon size={16} className="mr-1" />
                      Add Item
                    </button>
                  </div>
                  {newRecipe.ingredients.map((item, index) => <div key={index} className="flex gap-2 items-center mb-2">
                    {/* Searchable Ingredient Input */}
                    <div className="flex-1 min-w-0 relative" ref={activeItemIndex === index ? ingredientDropdownRef : null}>
                      <div className="relative">
                        <input type="text" value={item.name} onChange={e => {
                          handleUpdateRecipeItem(index, 'name', e.target.value);
                          setItemSearchQuery(e.target.value);
                          setActiveItemIndex(index);
                          setShowIngredientDropdown(true);
                        }} onFocus={() => {
                          setActiveItemIndex(index);
                          setShowIngredientDropdown(true);
                          setItemSearchQuery(item.name);
                        }} placeholder="Search item..." className="w-full p-2 pr-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                        <SearchIcon size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>

                      {/* Dropdown Menu */}
                      {showIngredientDropdown && activeItemIndex === index && <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {getFilteredPantryItems(itemSearchQuery).length > 0 ? getFilteredPantryItems(itemSearchQuery).map(pantryItem => <button key={pantryItem.name} type="button" onClick={() => handleSelectIngredient(pantryItem, index)} className="w-full text-left px-3 py-2 hover:bg-red-50 transition-colors text-sm border-b border-gray-100 last:border-b-0">
                          <div className="font-medium text-gray-800 capitalize">
                            {pantryItem.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {pantryItem.default_unit}{' '}
                          </div>
                        </button>) : <div></div>}
                      </div>}
                    </div>

                    <input type="number" min="1" value={item.quantity} onChange={e => handleUpdateRecipeItem(index, 'quantity', e.target.value)} className="w-14 p-2 text-sm border border-gray-200 rounded-lg" />
                    <input type="text" value={item.unit} onChange={e => handleUpdateRecipeItem(index, 'unit', e.target.value)} placeholder="Unit" className="w-14 p-2 text-sm border border-gray-200 rounded-lg" />
                    <button onClick={() => handleRemoveRecipeItem(index)} className="p-1 rounded-full hover:bg-red-50 text-red-500" aria-label={`Remove ${item.name || 'item'}`}>
                      <TrashIcon size={16} />
                      <span className="sr-only">Remove {item.name || 'item'}</span>
                    </button>
                  </div>)}
                </div>
                {newRecipeError && <p className="text-red-500 text-sm mb-2">{newRecipeError}</p>}
                <button onClick={handleSaveRecipe} disabled={!newRecipe.meal_name.trim() || newRecipe.ingredients.length === 0} className={`w-full py-3 px-4 rounded-xl font-medium ${newRecipe.meal_name.trim() && newRecipe.ingredients.length > 0 ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} transition-colors`}>
                  Log This Meal
                </button>
              </div>
            </div>
          </div>}
      </main>
      {/* Add Folder Modal */}
      {showAddFolder && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-lg max-w-sm w-full">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-medium text-gray-800">Create New Category</h3>
            <button onClick={() => setShowAddFolder(false)} className="p-1 rounded-full hover:bg-gray-100">
              <XIcon size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <label htmlFor="folder-name" className="block text-gray-700 mb-2">
                Category Name
              </label>
              <input type="text" id="folder-name" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Enter category name" className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowAddFolder(false)} className="w-1/2 bg-gray-100 text-gray-700 py-2 rounded-lg">
                Cancel
              </button>
              <button onClick={handleCreateFolder} disabled={!newFolderName.trim()} className={`w-1/2 ${newFolderName.trim() ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'} py-2 rounded-lg`}>
                Create
              </button>
            </div>
          </div>
        </div>
      </div>}
      {/* Edit Folder Modal */}
      {editingFolder && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-lg max-w-sm w-full">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-medium text-gray-800">Rename Category</h3>
            <button onClick={() => setEditingFolder(null)} className="p-1 rounded-full hover:bg-gray-100">
              <XIcon size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <label htmlFor="folder-name-edit" className="block text-gray-700 mb-2">
                Category Name
              </label>
              <input type="text" id="folder-name-edit" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Enter category name" className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setEditingFolder(null)} className="w-1/2 bg-gray-100 text-gray-700 py-2 rounded-lg">
                Cancel
              </button>
              <button onClick={handleUpdateFolder} disabled={!newFolderName.trim()} className={`w-1/2 ${newFolderName.trim() ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'} py-2 rounded-lg`}>
                Update
              </button>
            </div>
          </div>
        </div>
      </div>}
      {/* Delete Folder Confirmation Modal */}
      {showDeleteFolderConfirmation && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-lg max-w-sm w-full">
          <div className="p-6">
            <div className="flex items-center text-red-600 mb-4">
              <AlertCircleIcon size={24} className="mr-2" />
              <h3 className="text-lg font-medium">Delete Category</h3>
            </div>
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete "{folderToDelete?.name}"?
            </p>
            <p className="text-gray-500 text-sm mb-6">
              All recipes in this category will be moved to "Uncategorized".
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteFolderConfirmation(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteFolder} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>}
    </div></div>;
}