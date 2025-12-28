import React, { useState } from 'react';
import {
  BotMessageSquare,
  HomeIcon,
  CalendarIcon,
  PackageIcon,
  UtensilsIcon,
  SettingsIcon,
  ShoppingCart,
  MoreHorizontal
} from 'lucide-react';

interface BottomNavProps {
  activeView: string;
  onNavigate: (view: string, activeTabParam?: string) => void;
}

export function BottomNav({ activeView, onNavigate }: BottomNavProps) {
  const [showMore, setShowMore] = useState(false);

  /** 一級導航 */
  const primaryNav = [
    { pageId: 'home', icon: HomeIcon, label: 'Home' },
    { pageId: 'aiAssistant', icon: BotMessageSquare, label: 'AI Chat' },
    { pageId: 'calendar', icon: CalendarIcon, label: 'Calendar' },
    { pageId: 'pantryInventory', icon: PackageIcon, label: 'Pantry' }
  ];

  /** 二級導航（More） */
  const secondaryNav = [
    { pageId: 'shoppingList', icon: ShoppingCart, label: 'Shopping' },
    { pageId: 'recipeManager', icon: UtensilsIcon, label: 'Recipes' },
    { pageId: 'settings', icon: SettingsIcon, label: 'Settings' }
  ];

  return (
    <>
      {/* ===== 二級選單（More） ===== */}
      {showMore && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowMore(false)}>
          <div
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-56 bg-white rounded-xl shadow-xl p-2"
            onClick={e => e.stopPropagation()}
          >
            {secondaryNav.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.pageId}
                  onClick={() => {
                    onNavigate(item.pageId);
                    setShowMore(false);
                  }}
                  className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
                >
                  <Icon size={18} className="mr-3" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== Bottom Nav ===== */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="grid grid-cols-5 h-16 max-w-screen-lg mx-auto">
          {primaryNav.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.pageId;

            return (
              <button
                key={item.pageId}
                onClick={() => {
                  setShowMore(false);
                  onNavigate(item.pageId);
                }}
                className={`flex flex-col items-center justify-center transition-colors ${isActive ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : ''} />
                <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
              </button>
            );
          })}

          {/* More */}
          <button
            onClick={() => setShowMore(prev => !prev)}
            className={`flex flex-col items-center justify-center transition-colors ${showMore ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <MoreHorizontal size={20} />
            <span className="text-[10px] mt-0.5 font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
