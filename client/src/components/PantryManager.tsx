import React, { useState } from 'react';
import { ArrowLeftIcon, PlusIcon, MinusIcon, TrashIcon, SearchIcon, CalendarIcon, AlertTriangleIcon, PackageIcon, ShoppingCartIcon, CheckIcon } from 'lucide-react';
import { usePantry } from '../contexts/PantryContext';
interface PantryManagerProps {
  onBack: () => void;
  onShoppingList: () => void;
}
export function PantryManager({
  onBack,
  onShoppingList
}: PantryManagerProps) {
  const {
    pantryItems,
    updatePantryItems,
    shoppingList,
    updateShoppingList
  } = usePantry();
  const [searchQuery, setSearchQuery] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: '',
    expiryDate: ''
  });
  const [newShoppingItem, setNewShoppingItem] = useState({
    name: '',
    quantity: 1,
    unit: ''
  });
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isAddingShoppingItem, setIsAddingShoppingItem] = useState(false);
  const [activeTab, setActiveTab] = useState('current'); // 'current', 'expiring', or 'shopping'
  const [shoppingSearchQuery, setShoppingSearchQuery] = useState('');
  // Count items that need to be bought (in shopping list)
  const itemsToBuy = shoppingList.filter(item => !item.purchased).length;
  // Filter pantry items based on search query and active tab
  const filteredItems = pantryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'expiring') {
      // Check if item is expiring within 7 days
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      const today = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(today.getDate() + 7);
      return matchesSearch && expiryDate <= sevenDaysLater && expiryDate >= today;
    }
    return matchesSearch;
  });
  // Filter shopping list items
  const filteredShoppingItems = shoppingList.filter(item => item.name.toLowerCase().includes(shoppingSearchQuery.toLowerCase()));
  // Sort items by expiry date if on expiring tab
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (activeTab === 'expiring') {
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    }
    return 0;
  });
  const handleUpdateQuantity = (itemName: string, amount: number) => {
    const updatedItems = pantryItems.map(item => {
      if (item.name === itemName) {
        const newQuantity = Math.max(0, item.quantity + amount);
        return {
          ...item,
          quantity: newQuantity
        };
      }
      return item;
    });
    updatePantryItems(updatedItems);
  };
  const handleRemoveItem = (itemName: string) => {
    const updatedItems = pantryItems.filter(item => item.name !== itemName);
    updatePantryItems(updatedItems);
  };
  const handleAddItem = () => {
    if (!newItem.name.trim()) return;
    // Check if item already exists
    const existingItem = pantryItems.find(item => item.name.toLowerCase() === newItem.name.toLowerCase());
    if (existingItem) {
      // Update quantity if item exists
      const updatedItems = pantryItems.map(item => {
        if (item.name.toLowerCase() === newItem.name.toLowerCase()) {
          return {
            ...item,
            quantity: item.quantity + newItem.quantity,
            expiryDate: newItem.expiryDate || item.expiryDate
          };
        }
        return item;
      });
      updatePantryItems(updatedItems);
    } else {
      // Add new item
      updatePantryItems([...pantryItems, newItem]);
    }
    // Reset form
    setNewItem({
      name: '',
      quantity: 1,
      unit: '',
      expiryDate: ''
    });
    setIsAddingItem(false);
  };
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
      updatePantryItems(updatedPantry);
    } else {
      // Add new item to pantry
      updatePantryItems([...pantryItems, {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit
      }]);
    }
    // Mark as purchased in shopping list
    const updatedList = shoppingList.map(listItem => listItem.id === item.id ? {
      ...listItem,
      purchased: true
    } : listItem);
    updateShoppingList(updatedList);
  };
  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate: string) => {
    if (!expiryDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
            <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-100">
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
          <button onClick={() => setActiveTab('current')} className={`flex-1 py-3 px-4 font-medium ${activeTab === 'current' ? 'bg-red-50 text-red-600' : 'text-gray-700'}`}>
            Inventory
          </button>
          <button onClick={() => setActiveTab('expiring')} className={`flex-1 py-3 px-4 font-medium ${activeTab === 'expiring' ? 'bg-red-50 text-red-600' : 'text-gray-700'}`}>
            Expiring Soon
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
                <div className="space-y-3">
                  <input type="text" placeholder="Item name" value={newItem.name} onChange={e => setNewItem({
              ...newItem,
              name: e.target.value
            })} className="w-full p-2 border border-gray-200 rounded-lg" />
                  <div className="flex gap-2">
                    <input type="number" min="1" value={newItem.quantity} onChange={e => setNewItem({
                ...newItem,
                quantity: parseInt(e.target.value) || 1
              })} className="w-1/3 p-2 border border-gray-200 rounded-lg" />
                    <input type="text" placeholder="Unit (g, ml, etc.)" value={newItem.unit} onChange={e => setNewItem({
                ...newItem,
                unit: e.target.value
              })} className="w-2/3 p-2 border border-gray-200 rounded-lg" />
                  </div>
                  {/* Expiry Date Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon size={16} className="text-gray-400" />
                    </div>
                    <input type="date" placeholder="Expiry date (optional)" value={newItem.expiryDate} onChange={e => setNewItem({
                ...newItem,
                expiryDate: e.target.value
              })} className="w-full p-2 pl-10 border border-gray-200 rounded-lg" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setIsAddingItem(false)} className="w-1/2 bg-gray-100 text-gray-700 py-2 rounded-lg">
                      Cancel
                    </button>
                    <button onClick={handleAddItem} className="w-1/2 bg-red-600 text-white py-2 rounded-lg">
                      Add Item
                    </button>
                  </div>
                </div>
              </div>}

            {/* Inventory Tabs (only shown in inventory mode) */}
            {activeTab !== 'shopping' && <div className="flex mb-4 border-b border-gray-200">
                <button onClick={() => setActiveTab('current')} className={`py-2 px-4 font-medium ${activeTab === 'current' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  Current Inventory
                </button>
                <button onClick={() => setActiveTab('expiring')} className={`py-2 px-4 font-medium flex items-center ${activeTab === 'expiring' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  Expiring Soon
                  {pantryItems.some(item => {
              if (!item.expiryDate) return false;
              const daysLeft = getDaysUntilExpiry(item.expiryDate);
              return daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;
            }) && <span className="ml-2 bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      !
                    </span>}
                </button>
              </div>}

            {/* Pantry Items List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-semibold text-gray-800">
                  {activeTab === 'current' ? 'Current Inventory' : 'Expiring Soon'}
                </h2>
              </div>
              {sortedItems.length === 0 ? <div className="p-6 text-center">
                  <p className="text-gray-500">No items found</p>
                  {searchQuery && <p className="text-gray-400 text-sm mt-1">
                      Try a different search term
                    </p>}
                  {activeTab === 'expiring' && !searchQuery && <p className="text-gray-400 text-sm mt-1">
                      No items expiring within the next 7 days
                    </p>}
                </div> : <ul className="divide-y divide-gray-100">
                  {sortedItems.map(item => {
              const daysUntilExpiry = item.expiryDate ? getDaysUntilExpiry(item.expiryDate) : null;
              const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
              return <li key={item.name} className={`p-4 ${isExpiringSoon ? 'bg-red-50' : ''}`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-gray-800 capitalize">
                              {item.name}
                            </h3>
                            <div className="flex items-center">
                              <p className="text-gray-500 text-sm mr-2">
                                {item.quantity} {item.unit}
                              </p>
                              {item.expiryDate && <div className={`text-xs flex items-center ${daysUntilExpiry !== null && daysUntilExpiry <= 3 && daysUntilExpiry >= 0 ? 'text-red-600' : daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry >= 0 ? 'text-amber-600' : 'text-gray-500'}`}>
                                  {daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry >= 0 && <AlertTriangleIcon size={12} className="mr-1" />}
                                  {daysUntilExpiry !== null && daysUntilExpiry < 0 ? 'Expired' : daysUntilExpiry === 0 ? 'Expires today' : daysUntilExpiry === 1 ? 'Expires tomorrow' : daysUntilExpiry !== null ? `Expires in ${daysUntilExpiry} days` : ''}
                                </div>}
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