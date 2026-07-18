import React, { useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Home } from './components/Home';
import { Calendar } from './components/Calendar';
import { PantryInventory } from './components/PantryInventory';
import { ShoppingList } from './components/ShoppingList';
import { RecipeManager } from './components/RecipeManager';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import { Settings } from './components/Settings';
import { Loading } from './components/Loading';
import { PantryProvider } from './contexts/pantryContext';
import { AuthProvider, useAuth } from './contexts/authContext';
import { AICookingAssistant } from './components/AICookingAssistant';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { MarketingLanding } from './components/MarketingLanding';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const GUEST_VIEWS = new Set(['landing', 'login', 'signup']);

function AppContent() {
  const [currentView, setCurrentView] = useState('aiAssistant');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const {
    isAuthenticated,
    initializing
  } = useAuth();

  useEffect(() => {
    if (initializing) return;

    if (!isAuthenticated) {
      setCurrentView((prev) => (GUEST_VIEWS.has(prev) ? prev : 'landing'));
      return;
    }

    setCurrentView((prev) =>
      prev === 'landing' || prev === 'login' || prev === 'signup' ? 'aiAssistant' : prev,
    );
  }, [isAuthenticated, initializing]);

  const handleNavigate = (view: string,) => {
    setCurrentView(view);
  };

  const navigateToSignUp = () => {
    setCurrentView('signup');
  };
  const navigateToLogin = () => {
    setCurrentView('login');
  };

  const navigateToHome = () => {
    setCurrentView('home');
  };
  const navigateToCalendar = () => {
    setCurrentView('calendar');
  };

  const navigateToPantryInventory = () => {
    setCurrentView('pantryInventory');
  };

  const navigateToShoppingList = () => {
    setCurrentView('shoppingList');
  }
  const navigateToRecipeManager = () => {
    setCurrentView('recipeManager');
  };
  const navigateToSettings = () => {
    setCurrentView('settings');
  };
  const navigateToAiAssistant = () => {
    setCurrentView('aiAssistant');
  }

  // Show loading screen while checking authentication
  if (initializing) {
    return <Loading fullScreen />;
  }
  const isGuestView = GUEST_VIEWS.has(currentView);

  return <div className="w-full min-h-screen bg-linen">
    {/* Desktop Sidebar — hidden on mobile */}
    {!isGuestView && (
      <Sidebar activeView={currentView} onNavigate={handleNavigate} />
    )}

    {/* Main content area — offset for sidebar on desktop */}
    <div className={!isGuestView ? 'lg:pl-60' : ''}>
      {currentView === 'landing' && (
        <MarketingLanding onGetStarted={navigateToSignUp} onLogin={navigateToLogin} />
      )}
      {currentView === 'login' && (
        <Login
          onLoginSuccess={navigateToAiAssistant}
          onSignUp={navigateToSignUp}
        />
      )}
      {currentView === 'home' && isAuthenticated && <Home onLogin={navigateToLogin} onCookWithWhatIHave={navigateToAiAssistant} onViewCalendar={navigateToCalendar} onPantryInventory={navigateToPantryInventory} onShoppingList={navigateToShoppingList} onRecipeManager={navigateToRecipeManager} onSettings={navigateToSettings} />}
      {/* Keep chat mounted so streaming continues in the background when switching tabs */}
      {isAuthenticated && (
        <div
          className={currentView === 'aiAssistant' ? undefined : 'hidden'}
          aria-hidden={currentView !== 'aiAssistant'}
        >
          <AICookingAssistant
            isActive={currentView === 'aiAssistant'}
            onBack={navigateToHome}
            onViewRecipe={(recipeId) => {
              setSelectedRecipeId(recipeId);
              setCurrentView('recipeManager');
            }}
            onViewShoppingList={navigateToShoppingList}
            onViewCalendar={navigateToCalendar}
            onViewPantry={navigateToPantryInventory}
          />
        </div>
      )}
      {currentView === 'calendar' && isAuthenticated && <Calendar onBack={navigateToHome} />}
      {currentView === 'recipeManager' && isAuthenticated && (
        <RecipeManager
          onBack={navigateToHome}
          selectedRecipeId={selectedRecipeId}
          onSelectedRecipeHandled={() => setSelectedRecipeId(null)}
        />
      )}
      {currentView === 'settings' && isAuthenticated && <Settings onBack={navigateToHome} />}
      {currentView === 'pantryInventory' && isAuthenticated && <PantryInventory onBack={navigateToHome} />}
      {currentView === 'shoppingList' && isAuthenticated && <ShoppingList onBack={navigateToHome} />}
      {currentView === 'signup' && (
        <SignUp onSignUpSuccess={navigateToAiAssistant} onLogin={navigateToLogin} />
      )}
    </div>

    {/* Mobile BottomNav — hidden on desktop */}
    {!isGuestView && (
      <BottomNav activeView={currentView} onNavigate={handleNavigate} />
    )}
  </div>;
}
export function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <PantryProvider>
          <AppContent />
        </PantryProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}