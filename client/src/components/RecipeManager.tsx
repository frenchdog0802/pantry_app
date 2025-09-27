import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, PlusIcon, TrashIcon, SearchIcon, CalendarIcon, EditIcon, XIcon, ImageIcon, PackageIcon, UtensilsIcon } from 'lucide-react';
import { usePantry } from '../contexts/PantryContext';
import { IngredientEntry, Recipe } from '../api/types';

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
    updatePantryItems,
    fetchAllRecipes,
    pantryItems
  } = usePantry();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showIngredientSelector, setShowIngredientSelector] = useState(false);
  const [currentIngredient, setCurrentIngredient] = useState<IngredientEntry>({
    name: '',
    quantity: 1,
    unit: ''
  });
  const [newRecipe, setNewRecipe] = useState<Recipe>({
    id: '',
    date: new Date().toISOString().split('T')[0],
    mealName: '',
    mealType: 'dinner',
    ingredients: [],
    image: null,
  });

  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'dinner', label: 'Dinner' },
    { id: 'snack', label: 'Snack' },
  ];

  // Filter recipes based on search query
  const filteredRecipes = storedRecipes.filter(recipe => {
    const matchesSearch = recipe.ingredients && recipe.ingredients.some(item => item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) || recipe.mealName && recipe.mealName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleSelectPantryItem = (item: any) => {
    setCurrentIngredient({
      name: item.name,
      quantity: 1,
      unit: item.unit
    });
  };

  const handleAddIngredient = () => {
    if (!currentIngredient.name) return;
    const updatedIngredients = [...newRecipe.ingredients, currentIngredient];
    setNewRecipe({ ...newRecipe, ingredients: updatedIngredients });
    setCurrentIngredient({
      name: '',
      quantity: 1,
      unit: ''
    });
    setShowIngredientSelector(false);
  };

  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = newRecipe.ingredients.filter((_, i) => i !== index);
    setNewRecipe({ ...newRecipe, ingredients: updatedIngredients });
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        if (isEditing && selectedRecipe) {
          setSelectedRecipe({
            ...selectedRecipe,
            image: event.target?.result as string
          });
        } else {
          setNewRecipe({
            ...newRecipe,
            image: event.target?.result as string
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add a new item to the recipe
  const handleAddRecipeItem = () => {
    if (isEditing && selectedRecipe) {
      setSelectedRecipe({
        ...selectedRecipe,
        ingredients: [...selectedRecipe.ingredients, {
          name: '',
          quantity: 1,
          unit: '',
        }]
      });
    } else {
      setNewRecipe({
        ...newRecipe,
        ingredients: [...newRecipe.ingredients, {
          name: '',
          quantity: 1,
          unit: '',
        }]
      });
    }
  };

  // Update recipe item
  const handleUpdateRecipeItem = (index: number, field: keyof IngredientEntry, value: any) => {
    if (isEditing && selectedRecipe) {
      const updatedIngredients = [...selectedRecipe.ingredients];
      updatedIngredients[index] = {
        ...updatedIngredients[index],
        [field]: field === 'quantity' ? parseFloat(value) || 0 : value
      };
      setSelectedRecipe({
        ...selectedRecipe,
        ingredients: updatedIngredients,
      });
    } else {
      const updatedIngredients = [...newRecipe.ingredients];
      updatedIngredients[index] = {
        ...updatedIngredients[index],
        [field]: field === 'quantity' ? parseFloat(value) || 0 : value
      };
      setNewRecipe({
        ...newRecipe,
        ingredients: updatedIngredients,
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
      updateRecipe(selectedRecipe);
      setSelectedRecipe(null);
      setIsEditing(false);
    } else {
      addRecipe(newRecipe);
      setNewRecipe({
        id: '',
        date: new Date().toISOString().split('T')[0],
        mealName: '',
        mealType: 'dinner',
        ingredients: [],
        image: null,
      });
      setShowAddRecipe(false);
    }
  };

  // Add items from recipe to pantry
  const handleAddItemsToPantry = (ingredients: IngredientEntry[]) => {
    const updatedPantry = [...pantryItems];
    ingredients.forEach(item => {
      // Check if item already exists in pantry
      const existingItemIndex = updatedPantry.findIndex(pantryItem => pantryItem.name.toLowerCase() === item.name.toLowerCase());
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        updatedPantry[existingItemIndex] = {
          ...updatedPantry[existingItemIndex],
          quantity: updatedPantry[existingItemIndex].quantity + item.quantity
        };
      } else if (item.name.trim()) {
        // Add new item to pantry
        updatedPantry.push({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit
        });
      }
    });
    updatePantryItems(updatedPantry);
  };

  const filteredPantryItems = pantryItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    fetchAllRecipes();
  }, []);

  // Get meal type label
  const getMealTypeLabel = (type: string) => {
    switch (type) {
      case 'breakfast':
        return 'Breakfast';
      case 'lunch':
        return 'Lunch';
      case 'dinner':
        return 'Dinner';
      case 'snack':
        return 'Snack';
      default:
        return 'Meal';
    }
  };

  return <div className="flex flex-col w-full min-h-screen bg-gray-50">
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
        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon size={18} className="text-gray-400" />
          </div>
          <input type="text" placeholder="Search recipes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
        </div>
        {/* Add New Recipe Button */}
        <button onClick={() => setShowAddRecipe(true)} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-xl mb-6 shadow-sm transition-colors">
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
                    <UtensilsIcon size={16} className="text-red-500 mr-2" />
                    <h3 className="font-medium text-gray-800">
                      {recipe.mealName}{' '}
                      <span className="text-sm text-gray-500">
                        ({getMealTypeLabel(recipe.mealType)})
                      </span>
                    </h3>
                    {recipe.image && <ImageIcon size={16} className="ml-2 text-gray-400" />}
                  </div>
                  <p className="text-gray-500 text-sm">
                    {new Date(recipe.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <button onClick={() => {
                    setSelectedRecipe(recipe);
                    setIsEditing(true);
                  }} className="p-1.5 rounded-full hover:bg-blue-50 text-blue-600" aria-label="Edit recipe">
                    <EditIcon size={18} />
                  </button>
                  <button onClick={() => deleteRecipe(recipe.id)} className="p-1.5 rounded-full hover:bg-red-50 text-red-500" aria-label="Delete recipe">
                    <TrashIcon size={18} />
                  </button>
                </div>
              </div>
            </li>)}
          </ul>}
        </div>
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
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon size={16} className="text-gray-400" />
                      </div>
                      <input type="date" value={selectedRecipe.date} onChange={e => setSelectedRecipe({
                        ...selectedRecipe,
                        date: e.target.value
                      })} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg" />
                    </div>
                  </div>
                  <div className="w-1/2">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Meal Name
                    </label>
                    <input type="text" value={selectedRecipe.mealName} onChange={e => setSelectedRecipe({
                      ...selectedRecipe,
                      mealName: e.target.value
                    })} className="w-full p-2 border border-gray-200 rounded-lg" placeholder="Meal name" />
                  </div>
                </div>
                {/* Meal Type */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Meal Type
                  </label>
                  <select value={selectedRecipe.mealType} onChange={e => setSelectedRecipe({
                    ...selectedRecipe,
                    mealType: e.target.value as 'breakfast' | 'lunch' | 'dinner' | 'snack'
                  })} className="w-full p-2 border border-gray-200 rounded-lg">
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
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
                    <img src={selectedRecipe.image} alt="Meal" className="w-full h-full object-cover" />
                    <button onClick={() => setSelectedRecipe({
                      ...selectedRecipe,
                      image: null
                    })} className="absolute top-2 right-2 bg-white/80 p-1 rounded-full hover:bg-white text-red-500" aria-label="Remove image">
                      <XIcon size={20} />
                    </button>
                  </div>}
                </div>
                {/* Items List */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-700 text-sm font-medium">
                      Ingredients
                    </label>
                    <button onClick={handleAddRecipeItem} className="text-sm flex items-center text-red-600 hover:text-red-700">
                      <PlusIcon size={16} className="mr-1" />
                      Add Ingredient
                    </button>
                  </div>
                  {selectedRecipe.ingredients.map((item, index) => <div key={index} className="flex gap-2 items-center mb-2">
                    <input type="text" value={item.name} onChange={e => handleUpdateRecipeItem(index, 'name', e.target.value)} placeholder="Ingredient name" className="flex-1 p-2 border border-gray-200 rounded-lg" />
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
                      {selectedRecipe.mealName}
                    </h3>
                    <div className="flex items-center text-red-600 mt-1">
                      <UtensilsIcon size={16} className="mr-1" />
                      <span>
                        {getMealTypeLabel(selectedRecipe.mealType)}
                      </span>
                    </div>
                    <p className="text-gray-500 mt-1">
                      {new Date(selectedRecipe.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {selectedRecipe.image && <div className="rounded-xl overflow-hidden h-40 my-4">
                  <img src={selectedRecipe.image} alt="Meal" className="w-full h-full object-cover" />
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
                  <button onClick={() => handleAddItemsToPantry(selectedRecipe.ingredients)} className="w-1/2 bg-green-50 text-green-600 border border-green-100 py-2 rounded-lg flex items-center justify-center">
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
                <input type="text" id="meal-name" value={newRecipe.mealName} onChange={e => setNewRecipe({ ...newRecipe, mealName: e.target.value })} placeholder="Enter what you cooked" className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>

              {/* Date Selector */}
              <div>
                <label htmlFor="meal-date" className="block text-gray-700 mb-2">
                  Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon size={18} className="text-gray-400" />
                  </div>
                  <input type="date" id="meal-date" value={newRecipe.date} onChange={e => setNewRecipe({ ...newRecipe, date: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                </div>
              </div>

              <div>
                <label htmlFor="meal-type" className="block text-gray-700 mb-2">
                  Meal Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {mealTypes.map(type => <button key={type.id} type="button" onClick={() => setNewRecipe({ ...newRecipe, mealType: type.id as 'breakfast' | 'lunch' | 'dinner' | 'snack' })} className={`py-3 px-4 rounded-xl border ${newRecipe.mealType === type.id ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'} transition-colors`}>
                    {type.label}
                  </button>)}
                </div>
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Meal Photo (optional)
                </label>
                {!newRecipe.image ? <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                  <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 mb-2">Add a photo of your meal</p>
                  <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg border border-gray-200 inline-block transition-colors">
                    Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div> : <div className="relative rounded-xl overflow-hidden">
                  <img src={newRecipe.image} alt="Meal" className="w-full h-48 object-cover" />
                  <button onClick={() => setNewRecipe({ ...newRecipe, image: null })} className="absolute top-2 right-2 bg-white/80 p-1 rounded-full hover:bg-white text-red-500" aria-label="Remove image">
                    <XIcon size={20} />
                  </button>
                </div>}
              </div>

              {/* Ingredients Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-700">Ingredients Used</label>
                  <button onClick={() => setShowIngredientSelector(true)} className="text-sm flex items-center text-red-600 hover:text-red-700">
                    <PlusIcon size={16} className="mr-1" />
                    Add Ingredient
                  </button>
                </div>

                {newRecipe.ingredients.length === 0 ? <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-gray-500">
                  No ingredients added yet
                </div> : <ul className="bg-gray-50 border border-gray-200 rounded-xl divide-y divide-gray-200">
                  {newRecipe.ingredients.map((ingredient, index) => <li key={index} className="flex justify-between items-center p-3">
                    <div>
                      <p className="font-medium text-gray-800">
                        {ingredient.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {ingredient.quantity} {ingredient.unit}
                      </p>
                    </div>
                    <button onClick={() => handleRemoveIngredient(index)} className="p-1 rounded-full hover:bg-red-50 text-red-500">
                      <TrashIcon size={16} />
                    </button>
                  </li>)}
                </ul>}
              </div>

              <button onClick={handleSaveRecipe} disabled={!newRecipe.mealName.trim()} className={`w-full py-3 px-4 rounded-xl font-medium ${newRecipe.mealName.trim() ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} transition-colors`}>
                Log This Meal
              </button>
            </div>
          </div>
        </div>}
    </main>
    {/* Ingredient Selector Modal */}
    {showIngredientSelector && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-medium text-gray-800">Add Ingredient</h3>
          <button onClick={() => setShowIngredientSelector(false)} className="p-1 rounded-full hover:bg-gray-100">
            <XIcon size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon size={16} className="text-gray-400" />
            </div>
            <input type="text" placeholder="Search pantry items..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
          </div>

          {/* Pantry Items List */}
          <div className="max-h-60 overflow-y-auto mb-4">
            {filteredPantryItems.length > 0 ? <ul className="divide-y divide-gray-100">
              {filteredPantryItems.map(item => <li key={item.name} onClick={() => handleSelectPantryItem(item)} className={`p-3 cursor-pointer hover:bg-gray-50 rounded ${currentIngredient.name === item.name ? 'bg-red-50' : ''}`}>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  Available: {item.quantity} {item.unit}
                </p>
              </li>)}
            </ul> : <p className="text-center py-4 text-gray-500">
              No items found
            </p>}
          </div>

          {/* Custom Ingredient */}
          {!currentIngredient.name && <div className="mb-4">
            <div className="text-sm text-gray-500 mb-2">
              Or add custom ingredient:
            </div>
            <input type="text" placeholder="Ingredient name" value={currentIngredient.name} onChange={e => setCurrentIngredient({
              ...currentIngredient,
              name: e.target.value
            })} className="w-full p-2 mb-2 border border-gray-200 rounded-lg" />
          </div>}

          {/* Quantity Input */}
          {currentIngredient.name && <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">
              How much {currentIngredient.name} did you use?
            </label>
            <div className="flex gap-2">
              <input type="number" min="1" value={currentIngredient.quantity} onChange={e => setCurrentIngredient({
                ...currentIngredient,
                quantity: parseInt(e.target.value) || 1
              })} className="w-1/3 p-2 border border-gray-200 rounded-lg" />
              <input type="text" placeholder="Unit (g, ml, etc.)" value={currentIngredient.unit} onChange={e => setCurrentIngredient({
                ...currentIngredient,
                unit: e.target.value
              })} className="w-2/3 p-2 border border-gray-200 rounded-lg" />
            </div>
          </div>}

          <div className="flex gap-2">
            <button onClick={() => setShowIngredientSelector(false)} className="w-1/2 bg-gray-100 text-gray-700 py-2 rounded-lg">
              Cancel
            </button>
            <button onClick={handleAddIngredient} disabled={!currentIngredient.name} className={`w-1/2 ${currentIngredient.name ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} py-2 rounded-lg`}>
              Add Ingredient
            </button>
          </div>
        </div>
      </div>
    </div>}
  </div>;
}