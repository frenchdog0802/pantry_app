import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeftIcon, SendIcon, SaveIcon, RefreshCwIcon, ThumbsUpIcon, ShoppingCartIcon, ChevronRightIcon, FolderIcon, XIcon, ChevronDownIcon, MessageSquareIcon, PlusCircleIcon, SearchIcon } from 'lucide-react';
import { usePantry } from '../contexts/pantryContext';
import { IngredientEntry, PantryItem, Recipe, RecipeSuggestion } from '../api/types';
interface AICookingAssistantProps {
  onBack: () => void;
}
type MessageType =
  | 'text'
  | 'recipe'
  | 'system'
  | 'confirmation'
  | 'error';
// Define message types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  type?: MessageType;
  content: string;
  timestamp: number;
}
export function AICookingAssistant({
  onBack
}: AICookingAssistantProps) {
  const {
    pantryItems,
    recipes,
    addRecipe
  } = usePantry();
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    role: 'assistant',
    content: 'Hi! I can help you cook with what you have. What would you like to make today?',
    timestamp: Date.now()
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSavedRecipes, setShowSavedRecipes] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<RecipeSuggestion[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<RecipeSuggestion[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeSuggestion | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Load saved recipes from localStorage
  useEffect(() => {
    const savedRecipesData = localStorage.getItem('aiSavedRecipes');
    if (savedRecipesData) {
      try {
        setSavedRecipes(JSON.parse(savedRecipesData));
      } catch (error) {
        console.error('Failed to parse saved recipes', error);
        setSavedRecipes([]);
      }
    }
  }, []);
  // Save recipes to localStorage when they change
  useEffect(() => {
    localStorage.setItem('aiSavedRecipes', JSON.stringify(savedRecipes));
  }, [savedRecipes]);
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  // Generate a response based on user input
  const generateResponse = (userInput: string) => {
    setIsTyping(true);
    // Simulate typing delay
    setTimeout(() => {
      const availableIngredients = pantryItems.map(item => item.name.toLowerCase());
      const userInputLower = userInput.toLowerCase();
      // Determine if user is asking about specific ingredients
      const mentionedIngredients = availableIngredients.filter(ingredient => userInputLower.includes(ingredient));
      let response = '';
      let suggestedRecipesList: RecipeSuggestion[] = [];
      // Check if user is asking for recipe suggestions
      if (userInputLower.includes('recipe') || userInputLower.includes('make') || userInputLower.includes('cook') || userInputLower.includes('suggest') || userInputLower.includes('idea')) {
        // Filter recipes based on available ingredients
        const cookNowRecipes = recipes.filter(recipe => recipe.ingredients.every(ingredient => pantryItems.some(item => item.name.toLowerCase() === ingredient.name.toLowerCase() && item.quantity >= ingredient.quantity)));
        const needsOneItemRecipes = recipes.filter(recipe => {
          const missingIngredients = recipe.ingredients.filter(ingredient => !pantryItems.some(item => item.name.toLowerCase() === ingredient.name.toLowerCase() && item.quantity >= ingredient.quantity));
          return missingIngredients.length === 1;
        });
        // Generate response based on available recipes
        if (cookNowRecipes.length > 0) {
          response = `Based on what you have in your pantry, you can make these recipes:\n\n`;
          // Convert to our RecipeSuggestion format
          suggestedRecipesList = cookNowRecipes.map(recipe => ({
            id: `suggestion-${recipe.id}`,
            mealName: recipe.meal_name,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            cookTime: recipe.cookTime,
            image: recipe.image ?? undefined
          }));
          // Add to response
          suggestedRecipesList.forEach((recipe, index) => {
            response += `${index + 1}. ${recipe.mealName}\n`;
          });
          if (needsOneItemRecipes.length > 0) {
            response += `\nYou're also just one ingredient away from making these:\n\n`;
            // Add almost-there recipes to suggestions
            const almostThereRecipes = needsOneItemRecipes.map(recipe => {
              const missingIngredient = recipe.ingredients.find(ingredient => !pantryItems.some(item => item.name.toLowerCase() === ingredient.name.toLowerCase() && item.quantity >= ingredient.quantity));
              return {
                id: `suggestion-${recipe.id}`,
                mealName: recipe.meal_name,
                ingredients: recipe.ingredients,
                instructions: recipe.instructions,
                cookTime: recipe.cookTime,
                image: recipe.image ?? undefined,
                // @ts-ignore: allow extra property for UI
                missingIngredient
              };
            });
            suggestedRecipesList = [...suggestedRecipesList, ...almostThereRecipes];
            // Add to response
            almostThereRecipes.forEach((recipe, index) => {
              response += `${index + 1}. ${recipe.mealName} (missing: ${recipe.missingIngredient?.name})\n`;
            });
          }
        } else if (needsOneItemRecipes.length > 0) {
          response = `You're just one ingredient away from making these recipes:\n\n`;
          // Convert to our RecipeSuggestion format
          suggestedRecipesList = needsOneItemRecipes.map(recipe => {
            const missingIngredient = recipe.ingredients.find(ingredient => !pantryItems.some(item => item.name.toLowerCase() === ingredient.name.toLowerCase() && item.quantity >= ingredient.quantity));
            return {
              id: `suggestion-${recipe.id}`,
              mealName: recipe.meal_name,
              ingredients: recipe.ingredients,
              instructions: recipe.instructions,
              cookTime: recipe.cookTime,
              // difficulty: recipe.difficulty,
              image: recipe.image ?? undefined,
              missingIngredient
            };
          });
          // Add to response
          suggestedRecipesList.forEach((recipe, index) => {
            response += `${index + 1}. ${recipe.mealName} (missing: ${recipe.missingIngredient})\n`;
          });
        } else {
          response = "I don't see any recipes that match your current pantry items. Consider adding more ingredients to your pantry, or tell me what specific ingredients you'd like to cook with.";
        }
      }
      // Check if user is asking about specific ingredients
      else if (mentionedIngredients.length > 0) {
        response = `I see you have ${mentionedIngredients.join(', ')} in your pantry. `;
        // Filter recipes that use these ingredients
        const relevantRecipes = recipes.filter(recipe => recipe.ingredients.some(ingredient => mentionedIngredients.includes(ingredient.name.toLowerCase())));
        if (relevantRecipes.length > 0) {
          response += `You could use ${mentionedIngredients.length > 1 ? 'these' : 'this'} to make:\n\n`;
          // Convert to our RecipeSuggestion format
          suggestedRecipesList = relevantRecipes.map(recipe => ({
            id: `suggestion-${recipe.id}`,
            mealName: recipe.meal_name,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            cookTime: recipe.cookTime,
            image: recipe.image ?? undefined,
          }));
          // Add to response
          suggestedRecipesList.forEach((recipe, index) => {
            response += `${index + 1}. ${recipe.mealName}\n`;
          });
        } else {
          response += `I don't have specific recipes for these ingredients yet. Would you like me to suggest some common uses for them?`;
        }
      }
      // Default response
      else {
        response = `I'm here to help you cook with what you have in your pantry. You currently have ${pantryItems.length} items in your pantry. Would you like me to suggest recipes based on these ingredients? Or you can ask about specific ingredients.`;
      }
      // Add the response as a message
      const newMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setSuggestedRecipes(suggestedRecipesList);
      setIsTyping(false);
    }, 1000);
  };
  // Handle sending a message
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    // Generate response
    generateResponse(inputValue);
  };
  // Handle saving a recipe
  const handleSaveRecipe = (recipe: RecipeSuggestion) => {
    const recipeWithTimestamp = {
      ...recipe,
      savedAt: Date.now(),
      id: `saved-${Date.now()}`
    };
    setSavedRecipes(prev => [recipeWithTimestamp, ...prev]);
    // Add confirmation message
    const confirmationMessage: Message = {
      id: `confirmation-${Date.now()}`,
      role: 'assistant',
      content: `I've saved "${recipe.mealName}" to your recipes collection.`,
      timestamp: Date.now()
    };
    setMessages(prevMessages => [...prevMessages, confirmationMessage]);
  };
  // Handle clearing the chat
  const handleClearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I can help you cook with what you have. What would you like to make today?',
      timestamp: Date.now()
    }]);
    setSuggestedRecipes([]);
    setSelectedRecipe(null);
  };
  // Handle removing a saved recipe
  const handleRemoveSavedRecipe = (recipeId: string) => {
    setSavedRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
  };
  // Handle adding a recipe to the cooking app
  const handleAddToRecipes = (recipe: RecipeSuggestion) => {
    // Format recipe for the cooking app
    const newRecipe = {
      date: new Date().toISOString().split('T')[0],
      mealName: recipe.mealName,
      instructions: recipe.instructions,
      cookTime: recipe.cookTime,
      // difficulty: recipe.difficulty,
      ingredients: recipe.ingredients.map((ing: PantryItem) => ({
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
      })),
      image: recipe.image || null,
      folderId: 'ai-suggestions'
    };
    // Add to recipes
    addRecipe(newRecipe);
    // Add confirmation message
    const confirmationMessage: Message = {
      id: `confirmation-${Date.now()}`,
      role: 'assistant',
      content: `I've added "${recipe.mealName}" to your recipe collection. You can find it in the Recipe Manager.`,
      timestamp: Date.now()
    };
    setMessages(prevMessages => [...prevMessages, confirmationMessage]);
  };
  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return <div className="flex flex-col w-full min-h-screen bg-gray-50">
    <div className="flex-1 overflow-y-auto pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-5 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Go back">
            <ArrowLeftIcon size={24} />
          </button>
          <h1 className="text-xl font-bold">AI Cooking Assistant</h1>
          <div className="flex items-center">
            <button onClick={() => setShowSavedRecipes(!showSavedRecipes)} className={`p-2 rounded-full ${showSavedRecipes ? 'bg-white/20' : 'hover:bg-white/20'} transition-colors`} aria-label={showSavedRecipes ? 'Show chat' : 'Show saved recipes'}>
              {showSavedRecipes ? <MessageSquareIcon size={24} /> : <FolderIcon size={24} />}
            </button>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 container mx-auto p-5 flex flex-col">
        {showSavedRecipes /* Saved Recipes View */ ? <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Saved Recipes</h2>
            <button onClick={() => setShowSavedRecipes(false)} className="p-1 rounded-full hover:bg-gray-200" aria-label="Close">
              <XIcon size={18} className="text-gray-500" />
            </button>
          </div>
          {savedRecipes.length === 0 ? <div className="p-8 text-center text-gray-500">
            <FolderIcon size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No saved recipes yet</p>
            <p className="text-sm mt-2">
              Ask the AI for recipe suggestions and save them here
            </p>
          </div> : <div className="divide-y divide-gray-100">
            {savedRecipes.map(recipe => <div key={recipe.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between">
                <div className="flex-1 cursor-pointer" onClick={() => setSelectedRecipe(recipe)}>
                  <h3 className="font-medium text-gray-800">
                    {recipe.mealName}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {recipe.ingredients.length} ingredients • Saved{' '}
                    {new Date(recipe.savedAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleAddToRecipes(recipe)} className="p-1.5 rounded-full hover:bg-blue-50 text-blue-600" aria-label="Add to recipes" title="Add to recipes">
                    <PlusCircleIcon size={18} />
                  </button>
                  <button onClick={() => handleRemoveSavedRecipe(recipe.id)} className="p-1.5 rounded-full hover:bg-red-50 text-red-500" aria-label="Remove recipe" title="Remove from saved">
                    <XIcon size={18} />
                  </button>
                </div>
              </div>
            </div>)}
          </div>}
        </div> : selectedRecipe /* Recipe Detail View */ ? <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">
              {selectedRecipe.mealName}
            </h2>
            <button onClick={() => setSelectedRecipe(null)} className="p-1 rounded-full hover:bg-gray-200" aria-label="Close">
              <XIcon size={18} className="text-gray-500" />
            </button>
          </div>
          <div className="p-6">
            {selectedRecipe.image && <div className="rounded-xl overflow-hidden h-40 mb-6">
              <img src={selectedRecipe.image} alt={selectedRecipe.mealName} className="w-full h-full object-cover" />
            </div>}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Ingredients</h3>
              <ul className="space-y-2">
                {selectedRecipe.ingredients.map((ingredient: IngredientEntry, index: number) => <li key={index} className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                  <span>
                    {ingredient.quantity} {ingredient.unit}{' '}
                    {ingredient.name}
                  </span>
                </li>)}
              </ul>
            </div>
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Instructions</h3>
              <ol className="space-y-3">
                {selectedRecipe.instructions.map((step: string, index: number) => <li key={index} className="flex">
                  <div className="bg-red-100 rounded-full w-6 h-6 flex items-center justify-center text-red-700 font-medium mr-3 flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{step}</p>
                </li>)}
              </ol>
            </div>
            <div className="flex gap-2 pt-4">
              <button onClick={() => setSelectedRecipe(null)} className="w-1/2 bg-gray-100 text-gray-700 py-2 rounded-lg">
                Back
              </button>
              <button onClick={() => handleAddToRecipes(selectedRecipe)} className="w-1/2 bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center">
                <PlusCircleIcon size={18} className="mr-1" />
                Add to Recipes
              </button>
            </div>
          </div>
        </div> /* Chat View */ : <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                {messages.map(message => <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 ${message.role === 'user' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                    <div className="whitespace-pre-line">
                      {message.content}
                    </div>
                    <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-red-100' : 'text-gray-500'}`}>
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>)}
                {/* Show suggested recipes if available */}
                {suggestedRecipes.length > 0 && <div className="flex justify-start">
                  <div className="max-w-[80%] bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <h3 className="font-medium text-gray-800 mb-2">
                      Suggested Recipes
                    </h3>
                    <div className="space-y-3">
                      {suggestedRecipes.map(recipe => <div key={recipe.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-700">
                            {recipe.mealName}
                          </h4>
                          <div className="flex space-x-1">
                            <button onClick={() => setSelectedRecipe(recipe)} className="p-1 rounded-full hover:bg-gray-200 text-gray-600" title="View recipe">
                              <ChevronRightIcon size={16} />
                            </button>
                            <button onClick={() => handleSaveRecipe(recipe)} className="p-1 rounded-full hover:bg-blue-50 text-blue-600" title="Save recipe">
                              <SaveIcon size={16} />
                            </button>
                          </div>
                        </div>
                        {recipe.missingIngredient && <div className="flex items-center text-amber-600 text-xs">
                          <ShoppingCartIcon size={12} className="mr-1" />
                          <span>
                            Missing: {recipe.missingIngredient.name}
                          </span>
                        </div>}
                      </div>)}
                    </div>
                  </div>
                </div>}
                {isTyping && <div className="flex justify-start">
                  <div className="max-w-[80%] bg-gray-100 rounded-2xl p-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-100"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-200"></div>
                    </div>
                  </div>
                </div>}
                <div ref={messagesEndRef} />
              </div>
            </div>
            {/* Input Area */}
            <div className="border-t border-gray-100 p-4">
              <div className="flex items-center gap-2">
                <button onClick={handleClearChat} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full" title="Clear chat">
                  <RefreshCwIcon size={20} />
                </button>
                <div className="relative flex-1">
                  <input ref={inputRef} type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }} placeholder="Ask for recipe suggestions..." className="w-full py-3 px-4 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" disabled={isTyping} />
                  <button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping} className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-red-600 hover:text-red-700 disabled:text-gray-400">
                    <SendIcon size={20} />
                  </button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 justify-center">
                <button onClick={() => setInputValue('What can I make with what I have?')} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
                  What can I make?
                </button>
                <button onClick={() => setInputValue('I have chicken, what can I cook?')} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
                  Recipes with chicken
                </button>
                <button onClick={() => setInputValue('Suggest a quick dinner idea')} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
                  Quick dinner idea
                </button>
              </div>
            </div>
          </div>
        </>}
      </main>
    </div></div>;
}