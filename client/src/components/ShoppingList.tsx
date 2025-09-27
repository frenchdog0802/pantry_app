import React, { useState } from 'react';
import { ArrowLeftIcon, PlusIcon, CheckIcon, TrashIcon, SearchIcon, PackageIcon } from 'lucide-react';
import { usePantry } from '../contexts/PantryContext';
interface ShoppingListProps {
  onBack: () => void;
}
export function ShoppingList({
  onBack
}: ShoppingListProps) {
  const {
    shoppingList,
    updateShoppingList,
    pantryItems,
    updatePantryItems
  } = usePantry();
  const [searchQuery, setSearchQuery] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: ''
  });
  const [isAddingItem, setIsAddingItem] = useState(false);
  // Filter shopping list items based on search query
  const filteredItems = shoppingList.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const handleAddItem = () => {
    if (!newItem.name.trim()) return;
    // Add new item to shopping list
    const newShoppingItem = {
      id: `shopping-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: newItem.name,
      quantity: newItem.quantity,
      unit: newItem.unit,
      purchased: false
    };
    updateShoppingList([...shoppingList, newShoppingItem]);
    // Reset form
    setNewItem({
      name: '',
      quantity: 1,
      unit: ''
    });
    setIsAddingItem(false);
  };
  const handleTogglePurchased = (id: string) => {
    const updatedList = shoppingList.map(item => item.id === id ? {
      ...item,
      purchased: !item.purchased
    } : item);
    updateShoppingList(updatedList);
  };
  const handleRemoveItem = (id: string) => {
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
  return <div className="flex flex-col w-full min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-5 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Go back">
            <ArrowLeftIcon size={24} />
          </button>
          <h1 className="text-xl font-bold">Shopping List</h1>
          <div className="w-10"></div> {/* For layout balance */}
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 container mx-auto p-5">
        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon size={18} className="text-gray-400" />
          </div>
          <input type="text" placeholder="Search items..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
        </div>
        {/* Add New Item Button */}
        {!isAddingItem ? <button onClick={() => setIsAddingItem(true)} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-xl mb-6 shadow-sm transition-colors">
            <PlusIcon size={18} />
            <span>Add New Item</span>
          </button> : <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
            <h3 className="font-medium text-gray-700 mb-3">
              Add Item to Shopping List
            </h3>
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
        {/* Shopping List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800">Items to Buy</h2>
          </div>
          {filteredItems.length === 0 ? <div className="p-6 text-center">
              <p className="text-gray-500">No items in your shopping list</p>
              {searchQuery && <p className="text-gray-400 text-sm mt-1">
                  Try a different search term
                </p>}
            </div> : <ul className="divide-y divide-gray-100">
              {filteredItems.map(item => <li key={item.id} className={`p-4 ${item.purchased ? 'bg-gray-50' : ''}`}>
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
                      <button onClick={() => handleRemoveItem(item.id)} className="p-1.5 rounded-full hover:bg-red-50 text-red-500" aria-label="Remove item">
                        <TrashIcon size={18} />
                      </button>
                    </div>
                  </div>
                </li>)}
            </ul>}
        </div>
      </main>
    </div>;
}