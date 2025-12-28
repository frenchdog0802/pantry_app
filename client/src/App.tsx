import React, { useEffect, useState } from 'react';
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
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BottomNav } from './components/BottomNav';

function AppContent() {
  const [currentView, setCurrentView] = useState('home');
  const {
    isAuthenticated,
    loading
  } = useAuth();
  // Reset to login view if not authenticated
  useEffect(() => {
    // const location = useLocation();
    if (!loading && !isAuthenticated) {
      setCurrentView('login');
    }
  }, [isAuthenticated, loading]);

  const handleNavigate = (view: string,) => {
    setCurrentView(view);
  };

  const navigateToSignUp = () => {
    setCurrentView('signup');
  };
  const navigateToLogin = () => {
    setCurrentView('login');
  }

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
  if (loading) {
    return <Loading fullScreen />;
  }
  return <div className="w-full min-h-screen bg-gray-50">
    {currentView === 'login' && <Login onLoginSuccess={navigateToHome} onSignUp={navigateToSignUp} />}
    {currentView === 'home' && isAuthenticated && <Home onLogin={navigateToLogin} onCookWithWhatIHave={navigateToAiAssistant} onViewCalendar={navigateToCalendar} onPantryInventory={navigateToPantryInventory} onShoppingList={navigateToShoppingList} onRecipeManager={navigateToRecipeManager} onSettings={navigateToSettings} />}
    {currentView === 'aiAssistant' && isAuthenticated && <AICookingAssistant onBack={navigateToHome} />}
    {currentView === 'calendar' && isAuthenticated && <Calendar onBack={navigateToHome} />}
    {currentView === 'recipeManager' && isAuthenticated && <RecipeManager onBack={navigateToHome} />}
    {currentView === 'settings' && isAuthenticated && <Settings onBack={navigateToHome} />}
    {currentView === 'pantryInventory' && isAuthenticated && <PantryInventory onBack={navigateToHome} />}
    {currentView === 'shoppingList' && isAuthenticated && <ShoppingList onBack={navigateToHome} />}
    {currentView === 'signup' && <SignUp onSignUpSuccess={navigateToHome} onLogin={navigateToLogin} />}
    {currentView !== 'login' && currentView !== 'signup' && (
      <BottomNav activeView={currentView} onNavigate={handleNavigate} />
    )}
  </div>;
}
export function App() {
  return <AuthProvider>
    <PantryProvider>
      {/*vite config  */}
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AppContent />
      </GoogleOAuthProvider>
    </PantryProvider>
  </AuthProvider>;
}