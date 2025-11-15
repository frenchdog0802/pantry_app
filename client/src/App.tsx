import React, { useEffect, useState } from 'react';
import { Home } from './components/Home';
// import { RecipeSuggestions } from './components/RecipeSuggestions';
// import { RecipeDetail } from './components/RecipeDetail';
import { Calendar } from './components/Calendar';
import { PantryManager } from './components/PantryManager';
import { RecipeManager } from './components/RecipeManager';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import { Settings } from './components/Settings';
import { Loading } from './components/Loading';
import { PantryProvider } from './contexts/pantryContext';
import { AuthProvider, useAuth } from './contexts/authContext';
import { AICookingAssistant } from './components/AICookingAssistant';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useLocation } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';

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
    // const location = useLocation();
    if (!loading && !isAuthenticated) {
      setCurrentView('login');
    } else {
      // console.log("Location pathname:", location.pathname);
      // const path = location.pathname;
      // let view = 'home'; // default
      // let activeTabParam = '';

      // if (path === '/calendar') {
      //   view = 'calendar';
      // } else if (path.startsWith('/pantry')) {
      //   view = 'pantryManager';
      //   const tabMatch = path.match(/^\/pantry\/(.+)$/);
      //   if (tabMatch) {
      //     activeTabParam = tabMatch[1];
      //   }
      // } else if (path === '/recipe') {
      //   view = 'recipeManager';
      // } else if (path === '/settings') {
      //   view = 'settings';
      // } else if (path === '/ai') {
      //   view = 'aiAssistant';
      // } else if (path === '/signup') {
      //   view = 'signup';
      // } else if (path === '/login') {
      //   view = 'login';
      // }

      // setCurrentView(view);
      // if (activeTabParam) {
      //   setViewData({ activeTabParam });
      // }
    }
  }, [isAuthenticated, loading]);

  const handleNavigate = (view: string) => {
    setCurrentView(view);
  };

  const navigateToSignUp = () => {
    setCurrentView('signup');
  };
  const navigateToLogin = () => {
    setCurrentView('login');
  }
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
    {currentView === 'login' && <Login onLoginSuccess={navigateToHome} onSignUp={navigateToSignUp} />}
    {currentView === 'home' && isAuthenticated && <Home onLogin={navigateToLogin} onCookWithWhatIHave={navigateToAiAssistant} onViewCalendar={navigateToCalendar} onManagePantry={navigateToPantryManager} onRecipeManager={navigateToRecipeManager} onSettings={navigateToSettings} />}
    {/* {currentView === 'suggestions' && isAuthenticated && <RecipeSuggestions onSelectRecipe={navigateToRecipeDetail} onBack={navigateToHome} />}
      {currentView === 'recipeDetail' && isAuthenticated && <RecipeDetail recipe={selectedRecipe} onBack={() => setCurrentView('suggestions')} />} */}
    {currentView === 'aiAssistant' && isAuthenticated && <AICookingAssistant onBack={navigateToHome} />}
    {currentView === 'calendar' && isAuthenticated && <Calendar onBack={navigateToHome} />}
    {currentView === 'pantryManager' && isAuthenticated && <PantryManager onBack={navigateToHome} onManagePantry={(activeTabParam) => navigateToPantryManager(activeTabParam)} activeTabParam={viewData?.activeTabParam} />}
    {currentView === 'recipeManager' && isAuthenticated && <RecipeManager onBack={navigateToHome} />}
    {currentView === 'settings' && isAuthenticated && <Settings onBack={navigateToHome} />}
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