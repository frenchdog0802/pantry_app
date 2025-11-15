import React from 'react';
import { HomeIcon, CalendarIcon, PackageIcon, UtensilsIcon, MessageSquareIcon, SettingsIcon } from 'lucide-react';
interface BottomNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
}
export function BottomNav({
  activeView,
  onNavigate
}: BottomNavProps) {
  const navItems = [{
    id: 'home',
    icon: HomeIcon,
    label: 'Home'
  }, {
    id: 'calendar',
    icon: CalendarIcon,
    label: 'Calendar'
  }, {
    id: 'pantryManager',
    icon: PackageIcon,
    label: 'Pantry'
  }, {
    id: 'recipeManager',
    icon: UtensilsIcon,
    label: 'Recipes'
  }, {
    id: 'cookingAssistant',
    icon: MessageSquareIcon,
    label: 'AI Chef'
  }, {
    id: 'settings',
    icon: SettingsIcon,
    label: 'Settings'
  }];
  return <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="grid grid-cols-6 h-16">
        {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return <button key={item.id} onClick={() => onNavigate(item.id)} className={`flex flex-col items-center justify-center transition-colors ${isActive ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icon size={20} className={isActive ? 'stroke-[2.5]' : ''} />
              <span className="text-[10px] mt-0.5 font-medium">
                {item.label}
              </span>
            </button>;
      })}
      </div>
    </nav>;
}