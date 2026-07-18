import {
  BotMessageSquare,
  HomeIcon,
  CalendarIcon,
  PackageIcon,
  UtensilsIcon,
  SettingsIcon,
  ShoppingCart,
  ChefHatIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

const navItems = [
  { pageId: 'home', icon: HomeIcon, labelKey: 'nav.home' },
  { pageId: 'aiAssistant', icon: BotMessageSquare, labelKey: 'nav.aiChat' },
  { pageId: 'calendar', icon: CalendarIcon, labelKey: 'nav.calendar' },
  { pageId: 'pantryInventory', icon: PackageIcon, labelKey: 'nav.pantry' },
  { pageId: 'shoppingList', icon: ShoppingCart, labelKey: 'nav.shoppingList' },
  { pageId: 'recipeManager', icon: UtensilsIcon, labelKey: 'nav.recipes' },
  { pageId: 'settings', icon: SettingsIcon, labelKey: 'nav.settings' },
] as const;

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const { t } = useTranslation();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 bg-surface border-r border-line flex-col z-50">
      <div className="px-5 py-6 border-b border-line">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-herb flex items-center justify-center">
            <ChefHatIcon size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold text-ink leading-tight">LarderMind</h1>
            <p className="text-[11px] text-muted leading-tight">{t('nav.tagline')}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.pageId;

          return (
            <button
              key={item.pageId}
              onClick={() => onNavigate(item.pageId)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200
                ${isActive
                  ? 'bg-sage text-herb'
                  : 'text-muted hover:bg-linen hover:text-ink'
                }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{t(item.labelKey)}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-line">
        <p className="text-[11px] text-muted text-center">&copy; 2026 LarderMind</p>
      </div>
    </aside>
  );
}
