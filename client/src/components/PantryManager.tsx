import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeftIcon, PlusIcon, MinusIcon, TrashIcon, SearchIcon, PackageIcon, ShoppingCartIcon, CheckIcon } from 'lucide-react';
import { usePantry } from '../contexts/pantryContext';
import { PantryItem } from '../api/types';
import useSearchIngredients from '../hooks/useSearchIngredients';
import { NumberInput } from './NumberInput';

interface PantryManagerProps {
  onBack: () => void;
  onManagePantry: (activeTabParam: string) => void;
  activeTabParam?: string;
}
export function PantryManager({
  onBack,
  activeTabParam = 'inventory' // Default to 'inventory' if not provided
}: PantryManagerProps) {
  const {
    pantryItems: oriPantryItems,
    updatePantryItem,
    addPantryItem,
    removePantryItem,
    shoppingList: oriShoppingList,  // 改名 oriShoppingList 以區分
    ingredients,
    fetchAllIngredients,
    // shopping list functions
    addShoppingListItem,
    updateShoppingListItem,
    removeShoppingListItem
  } = usePantry();
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(oriPantryItems);
  const [shoppingList, setShoppingList] = useState(oriShoppingList);  // 新增本地 shoppingList 狀態，同步 context
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: '',
  });
  const [newShoppingItem, setNewShoppingItem] = useState({
    name: '',
    quantity: 1,
    unit: '',
    checked: false
  });
  // Pantry item search dropdown
  const { filteredIngredients: filteredPantryIngredients, loading: pantryLoading } = useSearchIngredients(
    newItem.name,
    pantryItems,
    ingredients,
    fetchAllIngredients
  );

  // Shopping item search dropdown
  const { filteredIngredients: filteredShoppingIngredients, loading: shoppingLoading } = useSearchIngredients(
    newShoppingItem.name,
    pantryItems,
    ingredients,
    fetchAllIngredients
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isAddingShoppingItem, setIsAddingShoppingItem] = useState(false);
  const isShoppingTab = activeTabParam === 'shopping';
  const [shoppingSearchQuery, setShoppingSearchQuery] = useState('');
  // Filter pantry items based on search query and active tab
  const filteredItems = useMemo(() => {
    return pantryItems.filter(item => {
      const isEnglish = /^[\x00-\x7F]*$/.test(item.name);
      const matchesSearch = isEnglish
        ? item.name.toLowerCase().includes(searchQuery.toLowerCase())
        : item.name.includes(searchQuery);
      return matchesSearch;
    });
  }, [pantryItems, searchQuery]);
  useEffect(() => {
    console.log('PantryItems updated:', pantryItems);
  }, [pantryItems]);

  // 同步 oriPantryItems 到本地 pantryItems
  useEffect(() => {
    setPantryItems(oriPantryItems);
  }, [oriPantryItems]);

  // 新增：同步 oriShoppingList 到本地 shoppingList
  useEffect(() => {
    setShoppingList(oriShoppingList);
  }, [oriShoppingList]);

  // Filter shopping list items（改用本地 shoppingList）
  const filteredShoppingItems = useMemo(() => {  // 加 useMemo 優化
    console.log('Recalculating filteredShoppingItems with query:', shoppingSearchQuery);
    return shoppingList.filter(item => {
      const isEnglish = /^[\x00-\x7F]*$/.test(item.name);
      return isEnglish
        ? item.name.toLowerCase().includes(shoppingSearchQuery.toLowerCase())
        : item.name.includes(shoppingSearchQuery);
    });
  }, [shoppingList, shoppingSearchQuery]);  // 依賴 shoppingList 和 query

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
    setShowDropdown(false);
    setIsAddingItem(false);
  }
  // Shopping List Functions
  const handleAddShoppingItem = () => {
    if (!newShoppingItem.name.trim()) return;
    // Check if item already exists in shopping list
    const existingItem = shoppingList.find(item => item.name.toLowerCase() === newShoppingItem.name.toLowerCase());
    if (existingItem) {
      updateShoppingListItem({ ...existingItem, quantity: newShoppingItem.quantity });
    } else {
      // Add new item
      addShoppingListItem({ ...newShoppingItem });
    }
    // Reset form
    setNewShoppingItem({
      name: '',
      quantity: 1,
      unit: '',
      checked: false
    });
    setIsAddingShoppingItem(false);
    setShowDropdown(false);
  };
  const handleTogglePurchased = async (id: string) => {
    const item = shoppingList.find(i => i.id === id);
    if (!item) return;
    const updatedItem = { ...item, checked: !item.checked };
    const res = await updateShoppingListItem(updatedItem);
    if (res.success && res.data) {
      setPantryItems(prevItems =>
        prevItems.map(pantryItem =>
          pantryItem.id === res.data.pantry_item_id
            ? {
              ...pantryItem,
              quantity: res.data.new_quantity || pantryItem.quantity,
              item_to_buy: updatedItem.checked ? 0 : res.data.new_item_to_buy || item.quantity
            }
            : pantryItem
        )
      );

      setShoppingList(prevList =>
        prevList.map(listItem =>
          listItem.id === id
            ? { ...listItem, checked: updatedItem.checked }
            : listItem
        )
      );

      if (!isShoppingTab && searchQuery) {
        setSearchQuery('');
      }

      const newChecked = updatedItem.checked;
      setMessage(newChecked ? 'Purchased! Added to your pantry. To Buy updated.' : 'Unmarked. To Buy restored.');
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    }
  };
  const handleRemoveShoppingItem = (id: string) => {
    if (removeShoppingListItem) {
      removeShoppingListItem(id);
    }
  };
  return <div className="flex flex-col w-full min-h-screen bg-gray-50">
    <div className="flex-1 overflow-y-auto pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-5 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Go back">
            <ArrowLeftIcon size={24} />
          </button>
          <h1 className="text-xl font-bold">
            {isShoppingTab ? 'Shopping List' : 'Kitchen Inventory'}
          </h1>
          <div className="w-10"></div> {/* For layout balance */}
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 container mx-auto p-5">
        {isShoppingTab ?
          // Shopping List Content
          <>
            {/* Success Message Alert */}
            {showMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm font-medium animate-fade-in">
                {message}
              </div>
            )}
            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon size={18} className="text-gray-400" />
              </div>
              <input type="text" placeholder="Search shopping items..." value={shoppingSearchQuery} onChange={e => setShoppingSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            {/* Add New Shopping Item Button */}
            {!isAddingShoppingItem ? (
              <button
                onClick={() => setIsAddingShoppingItem(true)}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-xl mb-6 shadow-sm transition-colors"
              >
                <PlusIcon size={18} />
                <span>Add New Shopping Item</span>
              </button>
            ) : (
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                <h3 className="font-medium text-gray-700 mb-3">
                  Add Item to Shopping List
                </h3>
                <div className="space-y-3 relative">
                  <input
                    type="text"
                    placeholder="Search or add item name"
                    value={newShoppingItem.name}
                    onChange={(e) =>
                      setNewShoppingItem({ ...newShoppingItem, name: e.target.value })
                    }
                    onFocus={() => setShowDropdown(true)}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  />

                  {showDropdown && filteredShoppingIngredients.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {filteredShoppingIngredients.map((ingredient: PantryItem) => (
                        <li key={ingredient.id} className="p-2 hover:bg-gray-100">
                          <button
                            onClick={() => {
                              setNewShoppingItem({ name: ingredient.name, unit: ingredient.unit || '', quantity: 1, checked: false });
                              setShowDropdown(false);
                            }}
                            className="w-full text-left"
                          >
                            {ingredient.name}{" "}
                            <span className="text-sm text-gray-400">
                              ({ingredient.unit})
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex gap-2">
                    <NumberInput min={0.1} step={0.5} value={newShoppingItem.quantity} onChange={value => setNewShoppingItem({
                      ...newShoppingItem,
                      quantity: value
                    })} className="w-1/3 p-2 rounded-lg" />
                    <input
                      type="text"
                      placeholder="Unit (g, ml, etc.)"
                      value={newShoppingItem.unit}
                      onChange={(e) =>
                        setNewShoppingItem({
                          ...newShoppingItem,
                          unit: e.target.value,
                        })
                      }
                      className="w-2/3 p-2 border border-gray-200 rounded-lg"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setNewShoppingItem({ name: '', quantity: 1, unit: '', checked: false });
                        setIsAddingShoppingItem(false);
                      }}
                      className="w-1/2 bg-gray-100 text-gray-700 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddShoppingItem}
                      className="w-1/2 bg-blue-600 text-white py-2 rounded-lg"
                    >
                      Add Item
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                {filteredShoppingItems.map(item => <li key={item.id} className={`p-4 ${item.checked ? 'bg-gray-50' : ''}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <button onClick={() => handleTogglePurchased(item.id)} className={`w-5 h-5 mr-3 flex-shrink-0 rounded border ${item.checked ? 'bg-green-500 border-green-500 flex items-center justify-center' : 'border-gray-300'}`} aria-label={item.checked ? 'Mark as not purchased' : 'Mark as purchased'}>
                        {item.checked && <CheckIcon size={12} className="text-white" />}
                      </button>
                      <div className={item.checked ? 'line-through text-gray-400' : ''}>
                        <h3 className="font-medium text-gray-800 capitalize">
                          {item.name}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {item.quantity} {item.unit}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
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

                {showDropdown && filteredPantryIngredients.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredPantryIngredients.map((ingredient: PantryItem) => (
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

                {pantryLoading && (
                  <div className="absolute bg-white text-gray-400 text-sm p-2 rounded-lg border w-full">
                    Loading...
                  </div>
                )}


                <div className="flex gap-2">
                  <NumberInput min={0.1} step={0.5} value={newItem.quantity} onChange={value => setNewItem({
                    ...newItem,
                    quantity: value
                  })} className="w-1/3 p-2  rounded-lg" />
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
            <div className="bg-white rounded-xl p-3 mb-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600 font-medium">Planned</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-gray-600 font-medium">To Buy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-600 font-medium">Pantry</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {filteredItems.length === 0 ? <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
                <PackageIcon size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500 text-sm">No items found</p>
                {searchQuery && <p className="text-gray-400 text-xs mt-1">
                  Try a different search term
                </p>}
              </div> : filteredItems.map(item => <div key={item.name} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Item Header */}
                <div className="p-4 pb-3">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 capitalize truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.unit}
                      </p>
                    </div>
                    <button onClick={() => handleRemoveItem(item.name)} className="p-2 rounded-lg hover:bg-red-50 active:bg-red-100 text-red-500 transition-colors -mr-2" aria-label="Remove item">
                      <TrashIcon size={16} />
                    </button>
                  </div>

                  {/* Status Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-100">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span className="text-xs font-medium text-blue-700">
                          Planned
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-blue-900">
                        {item.item_planned || 0}
                      </span>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-2 text-center border border-amber-100">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                        <span className="text-xs font-medium text-amber-700">
                          To Buy
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-amber-900">
                        {item.item_to_buy || 0}
                      </span>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 text-center border border-green-100">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-xs font-medium text-green-700">
                          Pantry
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-green-900">
                        {item.quantity || 0}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-center gap-3 pt-2 border-t border-gray-100">
                    <button onClick={() => handleUpdateQuantity(item.name, -1)} className="p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors" aria-label="Decrease quantity">
                      <MinusIcon size={18} className="text-gray-700" />
                    </button>
                    <div className="text-center min-w-[60px]">
                      <div className="text-2xl font-bold text-gray-800">
                        {item.quantity}
                      </div>
                    </div>
                    <button onClick={() => handleUpdateQuantity(item.name, 1)} className="p-2.5 rounded-lg bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors" aria-label="Increase quantity">
                      <PlusIcon size={18} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>)}
            </div>
          </>}
      </main>
    </div></div>;
}