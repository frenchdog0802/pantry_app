import { useEffect } from 'react';
import {
  ChefHatIcon,
  CalendarIcon,
  PackageIcon,
  ShoppingCartIcon,
  UtensilsIcon,
  SettingsIcon,
  ArrowRightIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePantry } from '../contexts/pantryContext';
import { useAuth } from '../contexts/authContext';

interface HomeProps {
  onCookWithWhatIHave: () => void;
  onViewCalendar: () => void;
  onPantryInventory: () => void;
  onShoppingList: () => void;
  onRecipeManager: () => void;
  onSettings: () => void;
  onLogin: () => void;
}

export function Home({
  onCookWithWhatIHave,
  onViewCalendar,
  onPantryInventory,
  onShoppingList,
  onRecipeManager,
  onSettings,
  onLogin,
}: HomeProps) {
  const { t } = useTranslation();
  const {
    shoppingList,
    pantryItems,
    fetchAllPantryItems,
    fetchAllShoppingListItems
  } = usePantry();
  const { user, initializing } = useAuth();

  useEffect(() => {
    if (!user) {
      onLogin();
    }
    fetchAllPantryItems();
    fetchAllShoppingListItems();
  }, [user]);

  const itemsToBuy = shoppingList.filter(item => !item.checked).length;

  if (initializing) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-linen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-line border-t-herb"></div>
        <p className="mt-4 text-muted">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-linen pb-20 lg:pb-0">
      <div className="lg:hidden flex justify-end px-6 py-3">
        <button
          onClick={onSettings}
          className="p-2 rounded-lg text-muted hover:text-ink hover:bg-sage/50 transition-colors"
          aria-label={t('nav.settings')}
        >
          <SettingsIcon size={22} />
        </button>
      </div>

      <section className="relative w-full min-h-[52vh] lg:min-h-[58vh] flex flex-col">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1600&q=80"
            alt={t('home.heroAlt')}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-linen via-linen/80 to-linen/30" />
        </div>

        <div className="relative z-10 flex flex-col flex-1 max-w-6xl mx-auto w-full px-6 lg:px-8 pt-8 lg:pt-16 pb-8 justify-end">
          <div className="animate-fade-up">
            <h1 className="font-display text-4xl lg:text-5xl font-semibold text-ink tracking-tight">
              LarderMind
            </h1>
            <p className="mt-3 text-lg lg:text-xl text-ink/80 max-w-md">
              {t('home.heroSubtitle')}
            </p>
            {user && (
              <p className="mt-1 text-sm text-muted">
                {t('home.welcomeBack', { name: user.name })}
              </p>
            )}
          </div>

          <div className="mt-8 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <button
              onClick={onCookWithWhatIHave}
              className="btn-primary flex items-center gap-2 text-base px-8 py-4"
            >
              <ChefHatIcon size={22} />
              {t('home.cookCta')}
            </button>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 lg:px-8 py-10">
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted mb-8">
          <span>{t('home.pantryCount', { count: pantryItems.length })}</span>
          <span className="text-line">|</span>
          <span>{t('home.buyCount', { count: itemsToBuy })}</span>
        </div>

        <nav className="divide-y divide-line">
          <button
            onClick={onViewCalendar}
            className="w-full flex items-center justify-between py-4 text-left group"
          >
            <div className="flex items-center gap-3">
              <CalendarIcon size={20} className="text-herb" />
              <div>
                <span className="font-medium text-ink group-hover:text-herb transition-colors">{t('home.planMeals')}</span>
                <p className="text-sm text-muted">{t('home.planMealsDesc')}</p>
              </div>
            </div>
            <ArrowRightIcon size={18} className="text-muted group-hover:text-herb transition-colors" />
          </button>

          <button
            onClick={onPantryInventory}
            className="w-full flex items-center justify-between py-4 text-left group"
          >
            <div className="flex items-center gap-3">
              <PackageIcon size={20} className="text-herb" />
              <div>
                <span className="font-medium text-ink group-hover:text-herb transition-colors">{t('home.pantry')}</span>
                <p className="text-sm text-muted">{t('home.pantryDesc', { count: pantryItems.length })}</p>
              </div>
            </div>
            <ArrowRightIcon size={18} className="text-muted group-hover:text-herb transition-colors" />
          </button>

          <button
            onClick={onShoppingList}
            className="w-full flex items-center justify-between py-4 text-left group"
          >
            <div className="flex items-center gap-3">
              <ShoppingCartIcon size={20} className="text-herb" />
              <div>
                <span className="font-medium text-ink group-hover:text-herb transition-colors">{t('home.shoppingList')}</span>
                <p className="text-sm text-muted">{t('home.shoppingListDesc', { count: itemsToBuy })}</p>
              </div>
            </div>
            <ArrowRightIcon size={18} className="text-muted group-hover:text-herb transition-colors" />
          </button>

          <button
            onClick={onRecipeManager}
            className="w-full flex items-center justify-between py-4 text-left group"
          >
            <div className="flex items-center gap-3">
              <UtensilsIcon size={20} className="text-herb" />
              <div>
                <span className="font-medium text-ink group-hover:text-herb transition-colors">{t('home.recipes')}</span>
                <p className="text-sm text-muted">{t('home.recipesDesc')}</p>
              </div>
            </div>
            <ArrowRightIcon size={18} className="text-muted group-hover:text-herb transition-colors" />
          </button>
        </nav>
      </main>
    </div>
  );
}
