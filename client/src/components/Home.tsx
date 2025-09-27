import React from 'react';
import { ChefHatIcon, CalendarIcon, ClipboardListIcon, PackageIcon, ShoppingCartIcon, UtensilsIcon, SettingsIcon } from 'lucide-react';
import { usePantry } from '../contexts/PantryContext';
import { useAuth } from '../contexts/AuthContext';
interface HomeProps {
  onCookWithWhatIHave: () => void;
  onViewCalendar: () => void;
  onManagePantry: () => void;
  onQuickLog: () => void;
  onShoppingList: () => void;
  onRecipeManager: () => void;
  onSettings: () => void;
}
export function Home({
  onCookWithWhatIHave,
  onViewCalendar,
  onManagePantry,
  onQuickLog,
  onShoppingList,
  onRecipeManager,
  onSettings
}: HomeProps) {
  const {
    shoppingList,
    pantryItems
  } = usePantry();
  const {
    user
  } = useAuth();
  // Count items that need to be bought (in shopping list)
  const itemsToBuy = shoppingList.filter(item => !item.purchased).length;
  return <div className="flex flex-col w-full min-h-screen bg-white">
    {/* Header */}
    <header className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-5 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">OrganizEat</h1>
        <div className="flex items-center">
          <button onClick={onViewCalendar} className="p-2 rounded-full hover:bg-white/20 transition-colors mr-2" aria-label="View Calendar">
            <CalendarIcon size={24} />
          </button>
          <button onClick={onSettings} className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Settings">
            <SettingsIcon size={24} />
          </button>
        </div>
      </div>
    </header>
    {/* Main Content */}
    <main className="flex-1 container mx-auto p-5 flex flex-col">
      {/* User Welcome */}
      {user && <div className="mb-6">
        <h2 className="text-xl font-medium text-gray-800">
          Welcome, {user.name}!
        </h2>
      </div>}
      {/* Kitchen Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h3 className="font-medium text-gray-700 mb-4 text-lg">
          My Kitchen Stats
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:bg-pink-50 hover:border-pink-100 transition-colors" onClick={onManagePantry}>
            <div className="text-3xl font-bold text-red-600 mb-1">
              {pantryItems.length}
            </div>
            <p className="text-gray-600">Items in Pantry</p>
          </div>
          <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:bg-blue-50 hover:border-blue-100 transition-colors" onClick={onShoppingList}>
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
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button onClick={onQuickLog} className="flex flex-col items-center justify-center p-5 bg-red-50 rounded-xl border border-red-100 hover:bg-red-100 transition-colors">
          <ClipboardListIcon size={32} className="text-red-600 mb-3" />
          <span className="text-gray-800 font-medium">Quick Log</span>
          <span className="text-xs text-gray-500 mt-1">
            Record what you cooked
          </span>
        </button>
        {/* <button onClick={onManagePantry} className="flex flex-col items-center justify-center p-5 bg-amber-50 rounded-xl border border-amber-100 hover:bg-amber-100 transition-colors">
          <PackageIcon size={32} className="text-amber-600 mb-3" />
          <span className="text-gray-800 font-medium">Inventory</span>
          <span className="text-xs text-gray-500 mt-1">
            Manage ingredients
          </span>
        </button> */}
        {/* <button onClick={onShoppingList} className="flex flex-col items-center justify-center p-5 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
          <ShoppingCartIcon size={32} className="text-blue-600 mb-3" />
          <span className="text-gray-800 font-medium">Shopping List</span>
          <div className="flex items-center justify-center mt-1">
            <span className="text-xs text-gray-500">Items to Buy: </span>
            <span className="ml-1 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {itemsToBuy}
            </span>
          </div>
        </button> */}
        <button onClick={onRecipeManager} className="flex flex-col items-center justify-center p-5 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition-colors">
          <UtensilsIcon size={32} className="text-green-600 mb-3" />
          <span className="text-gray-800 font-medium">Recipes</span>
          <span className="text-xs text-gray-500 mt-1">
            Manage your recipes
          </span>
        </button>
      </div>
      {/* Featured Image */}
      <div className="relative w-full h-72 rounded-2xl overflow-hidden mb-10 shadow-lg">
        <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" alt="Food preparation with fresh ingredients" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button onClick={onCookWithWhatIHave} className="flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-red-600 font-semibold py-4 px-8 rounded-xl shadow-lg transition-colors duration-200 mx-auto">
            <ChefHatIcon size={24} />
            <span className="text-lg">Cook with what I have</span>
          </button>
        </div>
      </div>
    </main>
  </div>;
}