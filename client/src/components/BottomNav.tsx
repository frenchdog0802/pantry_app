import React from 'react';
import { HomeIcon, CalendarIcon, PackageIcon, UtensilsIcon, SettingsIcon, ShoppingCart } from 'lucide-react';

interface BottomNavProps {
  activeView: string;
  activeTabParam?: string;
  onNavigate: (view: string, activeTabParam?: string) => void;
}

export function BottomNav({
  activeView,
  activeTabParam,
  onNavigate // <-- Ensure onNavigate is destructured and available
}: BottomNavProps) {

  const navItems = [{
    id: 'home',
    pageId: 'home',
    icon: HomeIcon,
    label: 'Home',
    activeTabParam: ''
  }, {
    id: 'calendar',
    pageId: 'calendar',
    icon: CalendarIcon,
    label: 'Calendar',
    activeTabParam: ''
  }, {
    id: 'pantryManager', // The Pantry Tab
    pageId: 'pantryManager',
    icon: PackageIcon,
    label: 'Pantry',
    activeTabParam: 'inventory'
  }, {
    id: 'shoppingList', // The Shopping Tab
    pageId: 'pantryManager',
    icon: ShoppingCart,
    label: 'Shopping',
    activeTabParam: 'shopping'
  }, {
    id: 'recipeManager',
    pageId: 'recipeManager',
    icon: UtensilsIcon,
    label: 'Recipes',
    activeTabParam: ''
  },
  {
    id: 'settings',
    pageId: 'settings',
    icon: SettingsIcon,
    label: 'Settings',
    activeTabParam: ''
  }];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="grid grid-cols-6 h-16 max-w-screen-lg mx-auto">
        {navItems.map(item => {
          const Icon = item.icon;

          // --- ACTIVE LOGIC (from previous refactor) ---
          const isPantryPage = item.pageId === 'pantryManager';

          const isActive = isPantryPage
            ? (activeView === item.pageId && activeTabParam === item.activeTabParam)
            : (activeView === item.pageId);
          // ---------------------------------------------

          return (
            <button
              key={item.id}
              // FIX: Ensure onNavigate is called correctly with the item's pageId and activeTabParam
              onClick={() => onNavigate(item.pageId, item.activeTabParam)}
              className={`flex flex-col items-center justify-center transition-colors ${isActive ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icon size={20} className={isActive ? 'stroke-[2.5]' : ''} />
              <span className="text-[10px] mt-0.5 font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}