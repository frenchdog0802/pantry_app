import React from 'react';
import { HomeIcon, CalendarIcon, PackageIcon, UtensilsIcon, SettingsIcon, ShoppingCart } from 'lucide-react';

interface BottomNavProps {
  activeView: string;
  onNavigate: (view: string, activeTabParam?: string) => void;
}

export function BottomNav({
  activeView,
  onNavigate
}: BottomNavProps) {

  const navItems = [{
    pageId: 'home',
    icon: HomeIcon,
    label: 'Home',
  }, {
    pageId: 'calendar',
    icon: CalendarIcon,
    label: 'Calendar',
  }, {
    pageId: 'pantryInventory',
    icon: PackageIcon,
    label: 'pantry',
  }, {
    pageId: 'shoppingList',
    icon: ShoppingCart,
    label: 'Shopping',
  }, {
    pageId: 'recipeManager',
    icon: UtensilsIcon,
    label: 'Recipes',
  },
  {
    pageId: 'settings',
    icon: SettingsIcon,
    label: 'Settings',
  }];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="grid grid-cols-6 h-16 max-w-screen-lg mx-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.pageId
          return (
            <button
              key={item.pageId}
              // FIX: Ensure onNavigate is called correctly with the item's pageId and activeTabParam
              onClick={() => onNavigate(item.pageId)}
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