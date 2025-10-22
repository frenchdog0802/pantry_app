import React, { useEffect, useState } from 'react';
import { Home } from './components/Home';
// import { RecipeSuggestions } from './components/RecipeSuggestions';
// import { RecipeDetail } from './components/RecipeDetail';
import { Calendar } from './components/Calendar';
import { PantryManager } from './components/PantryManager';
import { RecipeManager } from './components/RecipeManager';
import { Login } from './components/Login';
import { Settings } from './components/Settings';
import { Loading } from './components/Loading';
import { PantryProvider } from './contexts/PantryContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AICookingAssistant } from './components/AICookingAssistant';
import { GoogleOAuthProvider } from '@react-oauth/google';

function AppContent() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [viewData, setViewData] = useState<any>(null);
  const {
    isAuthenticated,
    loading
  } = useAuth();
  // Reset to login view if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setCurrentView('login');
    }
  }, [isAuthenticated, loading]);
  const navigateToSuggestions = () => {
    setCurrentView('suggestions');
  };
  const navigateToRecipeDetail = (recipe: any) => {
    setSelectedRecipe(recipe);
    setCurrentView('recipeDetail');
  };
  const navigateToHome = () => {
    setCurrentView('home');
  };
  const navigateToCalendar = () => {
    setCurrentView('calendar');
  };
  const navigateToPantryManager = (activeTabParam: string = '') => {
    setCurrentView('pantryManager');
    setViewData({ activeTabParam });
  };
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
    {currentView === 'login' && <Login onLoginSuccess={() => setCurrentView('home')} />}
    {currentView === 'home' && isAuthenticated && <Home onCookWithWhatIHave={navigateToAiAssistant} onViewCalendar={navigateToCalendar} onManagePantry={navigateToPantryManager} onRecipeManager={navigateToRecipeManager} onSettings={navigateToSettings} />}
    {/* {currentView === 'suggestions' && isAuthenticated && <RecipeSuggestions onSelectRecipe={navigateToRecipeDetail} onBack={navigateToHome} />}
      {currentView === 'recipeDetail' && isAuthenticated && <RecipeDetail recipe={selectedRecipe} onBack={() => setCurrentView('suggestions')} />} */}
    {currentView === 'aiAssistant' && isAuthenticated && <AICookingAssistant onBack={navigateToHome} />}
    {currentView === 'calendar' && isAuthenticated && <Calendar onBack={navigateToHome} />}
    {currentView === 'pantryManager' && isAuthenticated && <PantryManager onBack={navigateToHome} onManagePantry={(activeTabParam) => navigateToPantryManager(activeTabParam)} activeTabParam={viewData?.activeTabParam} />}
    {currentView === 'recipeManager' && isAuthenticated && <RecipeManager onBack={navigateToHome} />}
    {currentView === 'settings' && isAuthenticated && <Settings onBack={navigateToHome} />}
  </div>;
}
export function App() {
  return <AuthProvider>
    <PantryProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AppContent />
      </GoogleOAuthProvider>
    </PantryProvider>
  </AuthProvider>;
}