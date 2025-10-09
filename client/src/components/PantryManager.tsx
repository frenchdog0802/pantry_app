import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, PlusIcon, MinusIcon, TrashIcon, SearchIcon, CalendarIcon, AlertTriangleIcon, PackageIcon, ShoppingCartIcon, CheckIcon } from 'lucide-react';
import { usePantry } from '../contexts/PantryContext';
import { PantryItem } from '../api/Types';
interface PantryManagerProps {
  onBack: () => void;
  onManagePantry: (activeTabParam: string) => void;
  activeTabParam?: string;
}
export function PantryManager({
  onBack,
  onManagePantry,
  activeTabParam
}: PantryManagerProps) {
  const {
    pantryItems,
    updatePantryItem,
    addPantryItem,
    removePantryItem,
    shoppingList,
    ingredients,
    fetchAllIngredients,
    updateShoppingList
  } = usePantry();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: '',
  });
  const [newShoppingItem, setNewShoppingItem] = useState({
    name: '',
    quantity: 1,
    unit: ''
  });
  const [filteredIngredients, setFilteredIngredients] = useState<typeof pantryItems>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isAddingShoppingItem, setIsAddingShoppingItem] = useState(false);
  const [activeTab, setActiveTab] = useState(activeTabParam); // 'inventory' or 'shopping'
  const [shoppingSearchQuery, setShoppingSearchQuery] = useState('');
  // Count items that need to be bought (in shopping list)
  const itemsToBuy = shoppingList.filter(item => !item.purchased).length;
  // Filter pantry items based on search query and active tab
  const filteredItems = pantryItems.filter(item => {
    // if is not english dont toLowerCase, but if is english do toLowerCase
    const isEnglish = /^[\x00-\x7F]*$/.test(item.name);
    const matchesSearch = isEnglish
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase())
      : item.name.includes(searchQuery);
    return matchesSearch;
  });


  // Filter shopping list items
  const filteredShoppingItems = shoppingList.filter(item => {
    const isEnglish = /^[\x00-\x7F]*$/.test(item.name);
    return isEnglish
      ? item.name.toLowerCase().includes(shoppingSearchQuery.toLowerCase())
      : item.name.includes(shoppingSearchQuery);
  });
  const handleUpdateQuantity = (itemName: string, amount: number) => {
    const item = pantryItems.find(item => item.name === itemName);
    if (item) {
      const newQuantity = item.quantity + amount;
      if (newQuantity >= 0) {
        updatePantryItem({ ...item, quantity: newQuantity });
      }
    }
  };
  const handleRemoveItem = (itemName: string) => {
    const item = pantryItems.find(item => item.name === itemName);
    if (item && removePantryItem) {
      removePantryItem(item.id);
    }
  };

  useEffect(() => {
    const controller = new AbortController(); // 防止舊請求 race condition

    if (newItem.name.trim() === "") {
      setFilteredIngredients([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setLoading(true);
        fetchAllIngredients(newItem.name);

        // combine pantry items with fetched ingredients for dropdown
        const combined = [
          ...pantryItems.filter(p => p.name.toLowerCase().includes(newItem.name.toLowerCase())),
          ...ingredients
            .filter(i => i.name.toLowerCase().includes(newItem.name.toLowerCase()) && !pantryItems.some(p => p.name === i.name))
            .map(i => ({
              id: i.id,
              name: i.name,
              quantity: i.quantity ?? 1,
              unit: i.unit ?? ""
            }))
        ];
        setFilteredIngredients(combined);

      } catch (err) {
        console.error('Error fetching ingredients:', err);
        setFilteredIngredients([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce time

    return () => {
      clearTimeout(delayDebounce);
      controller.abort();
    };
  }, [newItem.name]);


  const handleSelectIngredient = (ingredient: PantryItem) => {
    setNewItem({
      ...newItem,
      name: ingredient.name,
      unit: ingredient.unit || "",
      quantity: ingredient.quantity || 1
    });
    setShowDropdown(false);
  };

  const handleAddItem = () => {
    if (!newItem.name.trim()) return;
    // Check if item already exists
    const existingItem = pantryItems.find(item => item.name.toLowerCase() === newItem.name.toLowerCase());
    if (existingItem) {
      updatePantryItem({ ...existingItem, quantity: newItem.quantity });
    } else {
      // Add new item
      addPantryItem({ ...newItem });
    }
    // Reset form
    setNewItem({
      name: '',
      quantity: 1,
      unit: '',
    });
    setIsAddingItem(false);
  };

  const handleCancelAddItem = () => {
    setNewItem({
      name: '',
      quantity: 1,
      unit: '',
    });
    setFilteredIngredients([]);
    setShowDropdown(false);
    setIsAddingItem(false);
  }
  // Shopping List Functions
  const handleAddShoppingItem = () => {
    if (!newShoppingItem.name.trim()) return;
    // Add new item to shopping list
    const newItem = {
      id: `shopping-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: newShoppingItem.name,
      quantity: newShoppingItem.quantity,
      unit: newShoppingItem.unit,
      purchased: false
    };
    updateShoppingList([...shoppingList, newItem]);
    // Reset form
    setNewShoppingItem({
      name: '',
      quantity: 1,
      unit: ''
    });
    setIsAddingShoppingItem(false);
  };
  const handleTogglePurchased = (id: string) => {
    const updatedList = shoppingList.map(item => item.id === id ? {
      ...item,
      purchased: !item.purchased
    } : item);
    updateShoppingList(updatedList);
  };
  const handleRemoveShoppingItem = (id: string) => {
    const updatedList = shoppingList.filter(item => item.id !== id);
    updateShoppingList(updatedList);
  };
  const handleAddToPantry = (item: any) => {
    // Check if item already exists in pantry
    const existingItem = pantryItems.find(pantryItem => pantryItem.name.toLowerCase() === item.name.toLowerCase());
    if (existingItem) {
      // Update quantity if item exists
      const updatedPantry = pantryItems.map(pantryItem => {
        if (pantryItem.name.toLowerCase() === item.name.toLowerCase()) {
          return {
            ...pantryItem,
            quantity: pantryItem.quantity + item.quantity
          };
        }
        return pantryItem;
      });
      // updatePantryItems(updatedPantry);
    } else {
      // Add new item to pantry
      // updatePantryItems([...pantryItems, {
      //   name: item.name,
      //   quantity: item.quantity,
      //   unit: item.unit
      // }]);
    }
    // Mark as purchased in shopping list
    const updatedList = shoppingList.map(listItem => listItem.id === item.id ? {
      ...listItem,
      purchased: true
    } : listItem);
    updateShoppingList(updatedList);
  };
  return <div className="flex flex-col w-full min-h-screen bg-gray-50">
    {/* Header */}
    <header className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-5 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Go back">
          <ArrowLeftIcon size={24} />
        </button>
        <h1 className="text-xl font-bold">
          {activeTab === 'shopping' ? 'Shopping List' : 'Kitchen Inventory'}
        </h1>
        <div className="w-10"></div> {/* For layout balance */}
      </div>
    </header>
    {/* Main Content */}
    <main className="flex-1 container mx-auto p-5">
      {/* Kitchen Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="font-medium text-gray-700 mb-4 text-lg">
          My Kitchen Stats
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:bg-pink-50 hover:border-pink-100 transition-colors" onClick={() => setActiveTab('inventory')}>
            <div className="text-3xl font-bold text-red-600 mb-1">
              {pantryItems.length}
            </div>
            <p className="text-gray-600">Items in Pantry</p>
          </div>
          <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:bg-blue-50 hover:border-blue-100 transition-colors" onClick={() => setActiveTab('shopping')}>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-blue-600 mb-1 mr-2">
                {itemsToBuy}
              </div>
              {itemsToBuy > 0 && <ShoppingCartIcon size={20} className="text-blue-600" />}
            </div>
            <p className="text-gray-600">Items to Buy</p>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex mb-6 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
        <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-3 px-4 font-medium ${activeTab === 'inventory' ? 'bg-red-50 text-red-600' : 'text-gray-700'}`}>
          Inventory
        </button>
        <button onClick={() => setActiveTab('shopping')} className={`flex-1 py-3 px-4 font-medium ${activeTab === 'shopping' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}>
          Shopping List
        </button>
      </div>

      {activeTab === 'shopping' ?
        // Shopping List Content
        <>
          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon size={18} className="text-gray-400" />
            </div>
            <input type="text" placeholder="Search shopping items..." value={shoppingSearchQuery} onChange={e => setShoppingSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          {/* Add New Shopping Item Button */}
          {!isAddingShoppingItem ? <button onClick={() => setIsAddingShoppingItem(true)} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-xl mb-6 shadow-sm transition-colors">
            <PlusIcon size={18} />
            <span>Add New Shopping Item</span>
          </button> : <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
            <h3 className="font-medium text-gray-700 mb-3">
              Add Item to Shopping List
            </h3>
            <div className="space-y-3">
              <input type="text" placeholder="Item name" value={newShoppingItem.name} onChange={e => setNewShoppingItem({
                ...newShoppingItem,
                name: e.target.value
              })} className="w-full p-2 border border-gray-200 rounded-lg" />
              <div className="flex gap-2">
                <input type="number" min="1" value={newShoppingItem.quantity} onChange={e => setNewShoppingItem({
                  ...newShoppingItem,
                  quantity: parseInt(e.target.value) || 1
                })} className="w-1/3 p-2 border border-gray-200 rounded-lg" />
                <input type="text" placeholder="Unit (g, ml, etc.)" value={newShoppingItem.unit} onChange={e => setNewShoppingItem({
                  ...newShoppingItem,
                  unit: e.target.value
                })} className="w-2/3 p-2 border border-gray-200 rounded-lg" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsAddingShoppingItem(false)} className="w-1/2 bg-gray-100 text-gray-700 py-2 rounded-lg">
                  Cancel
                </button>
                <button onClick={handleAddShoppingItem} className="w-1/2 bg-blue-600 text-white py-2 rounded-lg">
                  Add Item
                </button>
              </div>
            </div>
          </div>}

          {/* Shopping List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-800">Items to Buy</h2>
            </div>
            {filteredShoppingItems.length === 0 ? <div className="p-6 text-center">
              <p className="text-gray-500">
                No items in your shopping list
              </p>
              {shoppingSearchQuery && <p className="text-gray-400 text-sm mt-1">
                Try a different search term
              </p>}
            </div> : <ul className="divide-y divide-gray-100">
              {filteredShoppingItems.map(item => <li key={item.id} className={`p-4 ${item.purchased ? 'bg-gray-50' : ''}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <button onClick={() => handleTogglePurchased(item.id)} className={`w-5 h-5 mr-3 flex-shrink-0 rounded border ${item.purchased ? 'bg-green-500 border-green-500 flex items-center justify-center' : 'border-gray-300'}`} aria-label={item.purchased ? 'Mark as not purchased' : 'Mark as purchased'}>
                      {item.purchased && <CheckIcon size={12} className="text-white" />}
                    </button>
                    <div className={item.purchased ? 'line-through text-gray-400' : ''}>
                      <h3 className="font-medium text-gray-800 capitalize">
                        {item.name}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!item.purchased && <button onClick={() => handleAddToPantry(item)} className="p-1.5 rounded-full hover:bg-green-50 text-green-600" aria-label="Add to pantry" title="Add to pantry">
                      <PackageIcon size={18} />
                    </button>}
                    <button onClick={() => handleRemoveShoppingItem(item.id)} className="p-1.5 rounded-full hover:bg-red-50 text-red-500" aria-label="Remove item">
                      <TrashIcon size={18} />
                    </button>
                  </div>
                </div>
              </li>)}
            </ul>}
          </div>
        </> :
        // Inventory Content
        <>
          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon size={18} className="text-gray-400" />
            </div>
            <input type="text" placeholder="Search ingredients..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
          </div>

          {/* Add New Item Button */}
          {!isAddingItem ? <button onClick={() => setIsAddingItem(true)} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-xl mb-6 shadow-sm transition-colors">
            <PlusIcon size={18} />
            <span>Add New Item</span>
          </button> : <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
            <h3 className="font-medium text-gray-700 mb-3">Add New Item</h3>

            <div className="space-y-3 relative">
              <input
                type="text"
                placeholder="Search or add item name"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                onFocus={() => setShowDropdown(true)}
                className="w-full p-2 border border-gray-200 rounded-lg"
              />

              {showDropdown && filteredIngredients.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {filteredIngredients.map((ingredient) => (
                    <li
                      key={ingredient.id}
                      onClick={() => handleSelectIngredient(ingredient)}
                      className="px-3 py-2 hover:bg-red-50 cursor-pointer text-gray-700"
                    >
                      {ingredient.name}{" "}
                      <span className="text-sm text-gray-400">
                        ({ingredient.unit})
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {loading && (
                <div className="absolute bg-white text-gray-400 text-sm p-2 rounded-lg border w-full">
                  Loading...
                </div>
              )}


              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-1/3 p-2 border border-gray-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Unit (g, ml, etc.)"
                  value={newItem.unit}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      unit: e.target.value,
                    })
                  }
                  className="w-2/3 p-2 border border-gray-200 rounded-lg"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleCancelAddItem()}
                  className="w-1/2 bg-gray-100 text-gray-700 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  className="w-1/2 bg-red-600 text-white py-2 rounded-lg"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>}


          {/* Pantry Items List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-800">
                Current Inventory
              </h2>
            </div>
            {filteredItems.length === 0 ? <div className="p-6 text-center">
              <p className="text-gray-500">No items found</p>
              {searchQuery && <p className="text-gray-400 text-sm mt-1">
                Try a different search term
              </p>}
            </div> : <ul className="divide-y divide-gray-100">
              {filteredItems.map(item => {
                return <li key={item.name} className={`p-4`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-800 capitalize">
                        {item.name}
                      </h3>
                      <div className="flex items-center">
                        <p className="text-gray-500 text-sm mr-2">
                          {item.quantity} {item.unit}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleUpdateQuantity(item.name, -1)} className="p-1 rounded-full hover:bg-gray-100" aria-label="Decrease quantity">
                        <MinusIcon size={18} className="text-gray-600" />
                      </button>
                      <button onClick={() => handleUpdateQuantity(item.name, 1)} className="p-1 rounded-full hover:bg-gray-100" aria-label="Increase quantity">
                        <PlusIcon size={18} className="text-gray-600" />
                      </button>
                      <button onClick={() => handleRemoveItem(item.name)} className="p-1 rounded-full hover:bg-red-50 text-red-500" aria-label="Remove item">
                        <TrashIcon size={18} />
                      </button>
                    </div>
                  </div>
                </li>;
              })}
            </ul>}
          </div>
        </>}
    </main>
  </div>;
}