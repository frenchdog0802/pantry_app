import React, { useEffect, useState, useMemo } from 'react';
import { ArrowLeftIcon, CheckIcon, XIcon, PlusIcon, TrashIcon, SearchIcon, CalendarIcon, ImageIcon, CookingPot } from 'lucide-react';
import { usePantry } from '../contexts/PantryContext';
import { IngredientEntry } from '../api/Types';
interface QuickLogProps {
  onBack: () => void;
  onNavigateToRecipes: () => void;
}

export function QuickLog({
  onBack,
  onNavigateToRecipes
}: QuickLogProps) {
  const {
    recipes: storedRecipes,
    pantryItems,
    updatePantryItems,
    addToCookingHistory,
    addRecipe,
    fetchAllRecipes
  } = usePantry();
  const quickMealSuggestions = useMemo(
    () => storedRecipes.map((item: any) => item.mealName),
    [storedRecipes]
  );
  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState('dinner');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<IngredientEntry[]>([]);
  const [showIngredientSelector, setShowIngredientSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIngredient, setCurrentIngredient] = useState<IngredientEntry>({
    name: '',
    quantity: 1,
    unit: ''
  });
  // New state for date selection and image
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [mealImage, setMealImage] = useState<string | null>(null);
  const mealTypes = [{
    id: 'breakfast',
    label: 'Breakfast'
  }, {
    id: 'lunch',
    label: 'Lunch'
  }, {
    id: 'dinner',
    label: 'Dinner'
  }, {
    id: 'snack',
    label: 'Snack'
  }];




  useEffect(() => {
    fetchAllRecipes(); // Fetch suggestions on component mount
  }, []);
  // Filter pantry items based on search
  const filteredPantryItems = pantryItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const handleLogMeal = () => {
    if (!mealName.trim()) return;
    // Create a recipe object with ingredients
    const quickLogRecipe = {
      id: `quick-log-${Date.now()}`,
      mealName: mealName,
      mealType: mealType,
      ingredients: selectedIngredients,
      date: selectedDate,
      image: mealImage //mealImage Include image if exists
    };
    // Update pantry by decreasing used ingredients
    if (selectedIngredients.length > 0) {
      const updatedPantry = pantryItems.map(pantryItem => {
        const usedIngredient = selectedIngredients.find(ing => ing.name.toLowerCase() === pantryItem.name.toLowerCase());
        if (usedIngredient) {
          return {
            ...pantryItem,
            quantity: Math.max(0, pantryItem.quantity - usedIngredient.quantity)
          };
        }
        return pantryItem;
      });
      // Update pantry
      updatePantryItems(updatedPantry);
    }
    // Add to cooking history
    addToCookingHistory(quickLogRecipe);
    addRecipe(quickLogRecipe);
    // Show success message
    setSuccessMessage(`${mealName} added to your cooking log and inventory updated!`);
    // Reset form
    setMealName('');
    setSelectedIngredients([]);
    setMealImage(null);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };
  const handleQuickAdd = (suggestion: string) => {
    setMealName(suggestion);
  };
  const handleAddIngredient = () => {
    if (!currentIngredient.name) return;
    // Add ingredient to selected list
    setSelectedIngredients([...selectedIngredients, currentIngredient]);
    // Reset current ingredient
    setCurrentIngredient({
      name: '',
      quantity: 1,
      unit: ''
    });
    // Close selector
    setShowIngredientSelector(false);
  };
  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = [...selectedIngredients];
    updatedIngredients.splice(index, 1);
    setSelectedIngredients(updatedIngredients);
  };
  const handleSelectPantryItem = (item: any) => {
    setCurrentIngredient({
      name: item.name,
      quantity: 1,
      unit: item.unit
    });
  };
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        setMealImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  // Remove uploaded image
  const handleRemoveImage = () => {
    setMealImage(null);
  };
  return <div className="flex flex-col w-full min-h-screen bg-gray-50">
    {/* Header */}
    <header className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-5 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Go back">
          <ArrowLeftIcon size={24} />
        </button>
        <h1 className="text-xl font-bold">Quick Meal Log</h1>
        <button onClick={onNavigateToRecipes} className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="View Recipes">
          <CookingPot size={24} />
        </button>
      </div>
    </header>

    {/* Main Content */}
    <main className="flex-1 container mx-auto p-5">
      {/* Success Message */}
      {successMessage && <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6 flex items-center">
        <CheckIcon className="text-green-600 mr-2" size={20} />
        <p className="text-green-800">{successMessage}</p>
      </div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          What did you cook today?
        </h2>

        {/* Meal Input Form */}
        <div className="space-y-4">
          <div>
            <label htmlFor="meal-name" className="block text-gray-700 mb-2">
              Meal Name
            </label>
            <input type="text" id="meal-name" value={mealName} onChange={e => setMealName(e.target.value)} placeholder="Enter what you cooked" className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
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
              <input type="date" id="meal-date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label htmlFor="meal-type" className="block text-gray-700 mb-2">
              Meal Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {mealTypes.map(type => <button key={type.id} type="button" onClick={() => setMealType(type.id)} className={`py-3 px-4 rounded-xl border ${mealType === type.id ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'} transition-colors`}>
                {type.label}
              </button>)}
            </div>
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-gray-700 mb-2">
              Meal Photo (optional)
            </label>
            {!mealImage ? <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
              <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 mb-2">Add a photo of your meal</p>
              <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg border border-gray-200 inline-block transition-colors">
                Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div> : <div className="relative rounded-xl overflow-hidden">
              <img src={mealImage} alt="Meal" className="w-full h-48 object-cover" />
              <button onClick={handleRemoveImage} className="absolute top-2 right-2 bg-white/80 p-1 rounded-full hover:bg-white text-red-500" aria-label="Remove image">
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

            {selectedIngredients.length === 0 ? <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-gray-500">
              No ingredients added yet
            </div> : <ul className="bg-gray-50 border border-gray-200 rounded-xl divide-y divide-gray-200">
              {selectedIngredients.map((ingredient, index) => <li key={index} className="flex justify-between items-center p-3">
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

          <button onClick={handleLogMeal} disabled={!mealName.trim()} className={`w-full py-3 px-4 rounded-xl font-medium ${mealName.trim() ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} transition-colors`}>
            Log This Meal
          </button>
        </div>
      </div>

      {/* Quick Add Suggestions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-medium text-gray-700 mb-4">Quick Add</h3>
        <div className="flex flex-wrap gap-2">
          {quickMealSuggestions.map(suggestion => <button key={suggestion} onClick={() => handleQuickAdd(suggestion)} className="bg-gray-50 hover:bg-gray-100 text-gray-800 py-2 px-4 rounded-lg border border-gray-200 text-sm transition-colors">
            {suggestion}
          </button>)}
        </div>
      </div>
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