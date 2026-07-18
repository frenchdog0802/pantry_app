import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, SendIcon, RefreshCwIcon, ShoppingCartIcon, ChevronRightIcon, XIcon, PlusCircleIcon } from 'lucide-react';
import { usePantry } from '../contexts/pantryContext';
import { chatApi, ChatResponse, HistoryMessage } from '../api/chat';
import { mealPlanApi } from '../api/mealPlan';
import { RecipeSuggestion } from '../api/types';
import ChatMessageContent from './ChatMessageContent';

interface AICookingAssistantProps {
  /** When false, the view is hidden but stays mounted so streams keep running. */
  isActive?: boolean;
  onBack: () => void;
  onViewRecipe?: (recipeId: string) => void;
  onViewShoppingList?: () => void;
  onViewCalendar?: () => void;
  onViewPantry?: () => void;
}

type MessageType =
  | 'text'
  | 'recipe_created'
  | 'recipe_imported'
  | 'recipe_updated'
  | 'shopping_list_updated'
  | 'meal_plan_updated'
  | 'pantry_updated'
  | 'preferences_updated'
  | 'meal_suggestions'
  | 'multi_action'
  | 'action_result'
  | 'system'
  | 'confirmation'
  | 'error';

interface ResponseCardData {
  recipeId?: string;
  recipeName?: string;
  ingredientCount?: number;
  steps?: string[];
  sourceUrl?: string;
  imported?: boolean;
  itemsAdded?: number;
  items?: Array<{ name: string; quantity?: string | number; unit?: string }>;
  mealPlanId?: string;
  mealType?: string;
  servingDate?: string;
  mealsScheduled?: number;
  meals?: Array<{ meal_name?: string; serving_date?: string; meal_type?: string }>;
  mergedGroups?: number;
  removedDuplicates?: number;
  suggestions?: Array<{ recipeId?: string; recipeName?: string; matchScore?: number; missingIngredients?: string[] }>;
  actionCount?: number;
  actions?: Array<Record<string, unknown>>;
  message?: string;
  allergies?: string[];
  dislikes?: string[];
  likes?: string[];
  dietaryRestrictions?: string[];
  householdNotes?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  type?: MessageType;
  content: string;
  timestamp: number;
  cardData?: ResponseCardData;
  streaming?: boolean;
  statusText?: string;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hi! Tell me what you need — import a recipe URL, plan your week, update your pantry, or ask what you can cook. I\'ll handle it and show you what changed.',
  timestamp: Date.now(),
};

const SUGGESTED_PROMPTS = [
  'What can I cook with what I have?',
  'Plan dinners for the rest of this week',
  'Import a recipe from a URL',
  'Add chicken, rice, and broccoli to my pantry',
  'Organize my pantry',
];

export function AICookingAssistant({
  isActive = true,
  onBack,
  onViewRecipe,
  onViewShoppingList,
  onViewCalendar,
  onViewPantry,
}: AICookingAssistantProps) {
  const { t } = useTranslation();
  const {
    addRecipe,
    fetchAllRecipes,
    fetchAllShoppingListItems,
    fetchAllPantryItems,
    fetchAllMealPlans,
  } = usePantry();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedRecipes, setSuggestedRecipes] = useState<RecipeSuggestion[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeSuggestion | null>(null);
  const [addingToMenuRecipeId, setAddingToMenuRecipeId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await chatApi.getHistory();
        if (response.success && response.data?.messages?.length) {
          const historyMessages = response.data.messages.map((entry: HistoryMessage) => ({
            id: entry.id,
            role: entry.role,
            content: entry.content.replace(/^\[Pantry context:[^\]]*\]\s*/i, '').trim() || entry.content,
            timestamp: entry.createdAt * 1000,
          }));
          setMessages(historyMessages);
        }
      } catch (error) {
        console.error('Failed to load chat history', error);
      }
    };

    loadHistory();
  }, []);

  // Scroll to bottom of messages (only while the chat tab is visible)
  useEffect(() => {
    if (!isActive) return;
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, isActive]);
  // Focus input when chat becomes visible
  useEffect(() => {
    if (!isActive) return;
    inputRef.current?.focus();
  }, [isActive]);
  const mapResponseToMessage = (response: ChatResponse): Message => {
    const cardTypes: MessageType[] = [
      'recipe_created', 'recipe_imported', 'recipe_updated',
      'shopping_list_updated', 'meal_plan_updated', 'pantry_updated',
      'preferences_updated', 'meal_suggestions', 'multi_action', 'action_result',
    ];
    const cardData = response.data as ResponseCardData | undefined;
    return {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      type: response.type === 'error' ? 'error' : response.type as MessageType,
      content: response.message,
      timestamp: Date.now(),
      cardData: cardTypes.includes(response.type as MessageType) ? cardData : undefined,
    };
  };

  const refreshAfterAgentAction = async (type: MessageType) => {
    const tasks: Promise<unknown>[] = [];
    if (['recipe_created', 'recipe_imported', 'recipe_updated', 'meal_suggestions', 'multi_action', 'action_result'].includes(type)) {
      tasks.push(fetchAllRecipes());
    }
    if (['meal_plan_updated', 'meal_suggestions', 'multi_action', 'action_result'].includes(type)) {
      tasks.push(fetchAllMealPlans());
    }
    if (['pantry_updated', 'meal_suggestions', 'multi_action', 'action_result'].includes(type)) {
      tasks.push(fetchAllPantryItems());
    }
    if (['shopping_list_updated', 'meal_plan_updated', 'multi_action', 'action_result'].includes(type)) {
      tasks.push(fetchAllShoppingListItems());
    }
    await Promise.all(tasks);
  };

  const handleAddCreatedRecipeToMenu = async (recipeId: string) => {
    setAddingToMenuRecipeId(recipeId);
    try {
      const servingDate = new Date().toISOString().slice(0, 10);
      const response = await mealPlanApi.create({
        recipe_id: recipeId,
        meal_type: 'dinner',
        serving_date: servingDate,
      });
      if (!response.success) {
        throw new Error(response.message || "Failed to add recipe to today's dinner");
      }
      await Promise.all([fetchAllMealPlans(), fetchAllRecipes()]);
      const confirmationMessage: Message = {
        id: `confirmation-${Date.now()}`,
        role: 'assistant',
        content: `Added to today's dinner (${servingDate}). Open Calendar to see it — also filed under Dinner.`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, confirmationMessage]);
    } catch (error) {
      console.error("Failed to add recipe to today's dinner", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        type: 'error',
        content: "Could not add this recipe to today's dinner. Please try again.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setAddingToMenuRecipeId(null);
    }
  };

  const handleViewCreatedRecipe = async (recipeId: string) => {
    await fetchAllRecipes();
    onViewRecipe?.(recipeId);
  };

  const handleViewCalendar = async () => {
    await fetchAllMealPlans();
    onViewCalendar?.();
  };

  const handleViewPantry = async () => {
    await fetchAllPantryItems();
    onViewPantry?.();
  };

  const handleViewShoppingList = async () => {
    await fetchAllShoppingListItems();
    onViewShoppingList?.();
  };

  const renderRecipeCard = (message: Message, label = 'Recipe') => {
    const steps = message.cardData?.steps ?? [];
    return (
      <div className="mt-3 bg-surface border border-line rounded-xl p-4">
        <h3 className="font-medium text-ink">{label}: {message.cardData?.recipeName}</h3>
        <p className="text-sm text-muted mt-1">
          {message.cardData?.ingredientCount ?? 0} ingredients · {steps.length} steps
        </p>
        {message.cardData?.sourceUrl && (
          <p className="text-xs text-muted mt-1 truncate">From: {message.cardData.sourceUrl}</p>
        )}
        {steps.length > 0 && (
          <ol className="mt-3 space-y-2 max-h-48 overflow-y-auto">
            {steps.map((step, index) => (
              <li key={index} className="flex text-sm text-ink">
                <span className="bg-sage rounded-full w-5 h-5 flex items-center justify-center text-herb-deep font-medium mr-2 flex-shrink-0 text-xs mt-0.5">
                  {index + 1}
                </span>
                <span className="leading-snug">{step}</span>
              </li>
            ))}
          </ol>
        )}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => message.cardData?.recipeId && handleViewCreatedRecipe(message.cardData.recipeId)}
            className="flex-1 bg-sage/40 text-ink py-2 rounded-lg text-sm"
          >
            Edit Recipe
          </button>
          <button
            onClick={() => message.cardData?.recipeId && handleAddCreatedRecipeToMenu(message.cardData.recipeId)}
            disabled={addingToMenuRecipeId === message.cardData?.recipeId}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm disabled:opacity-60"
          >
            Add to today's dinner
          </button>
        </div>
      </div>
    );
  };

  // Generate a streaming response from the backend
  const generateResponse = async (userInput: string) => {
    const assistantId = `assistant-${Date.now()}`;
    const streamingMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      streaming: true,
    };

    setMessages(prev => [...prev, streamingMessage]);
    setIsTyping(true);
    let settled = false;

    const settleStreaming = (updater: (message: Message) => Message) => {
      settled = true;
      setMessages(prev => prev.map(message =>
        message.id === assistantId ? updater(message) : message
      ));
    };

    try {
      await chatApi.streamSend(
        { message: userInput },
        {
          onToken: (token) => {
            setMessages(prev => prev.map(message =>
              message.id === assistantId
                ? { ...message, content: message.content + token, statusText: undefined }
                : message
            ));
          },
          onStatus: (status) => {
            setMessages(prev => prev.map(message =>
              message.id === assistantId
                ? { ...message, statusText: status.message }
                : message
            ));
          },
          onDone: async (response) => {
            const finalized = mapResponseToMessage(response);
            settleStreaming((message) => ({
              ...finalized,
              id: assistantId,
              timestamp: message.timestamp,
              streaming: false,
              statusText: undefined,
            }));
            if (finalized.type && finalized.type !== 'text' && finalized.type !== 'error') {
              await refreshAfterAgentAction(finalized.type);
            }
            setSuggestedRecipes([]);
          },
          onError: (message) => {
            settleStreaming((entry) => ({
              ...entry,
              type: 'error',
              content: message || "I'm sorry, I'm having trouble connecting to my cooking brain right now. Please try again in a moment.",
              streaming: false,
              statusText: undefined,
            }));
          },
        },
      );
    } catch (error) {
      console.error('Chat stream error:', error);
      if (!settled) {
        settleStreaming((message) => ({
          ...message,
          type: 'error',
          content: "I'm sorry, I'm having trouble connecting to my cooking brain right now. Please try again in a moment.",
          streaming: false,
        }));
      }
    } finally {
      setIsTyping(false);
      if (!settled) {
        setMessages(prev => prev.map(message =>
          message.id === assistantId
            ? { ...message, streaming: false }
            : message
        ));
      }
    }
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
  // Handle clearing the chat (UI + server history + AI memory)
  const handleClearChat = async () => {
    try {
      await chatApi.clearHistory();
    } catch (error) {
      console.error('Failed to clear chat history', error);
    }
    setMessages([WELCOME_MESSAGE]);
    setSuggestedRecipes([]);
    setSelectedRecipe(null);
    setInputValue('');
  };
  // Handle adding a recipe to the cooking app
  const handleAddToRecipes = (recipe: RecipeSuggestion) => {
    // Format recipe for the cooking app
    // Using cast to any to satisfy the complex Recipe type while providing essential fields
    const newRecipe: any = {
      id: `ai-recipe-${Date.now()}`,
      folder_id: 'ai-suggestions',
      meal_name: recipe.mealName || recipe.name,
      instructions: recipe.instructions,
      cookTime: recipe.cookTime,
      ingredients: recipe.ingredients.map((ing: any) => ({
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
      })),
      image: recipe.image ? { public_id: 'ai-gen', url: recipe.image } : null
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
  return <div className="flex flex-col w-full min-h-screen bg-linen">
    <div className="flex-1 overflow-y-auto pb-20 lg:pb-6">
      {/* Page title */}
      <div className="max-w-2xl mx-auto px-6 lg:px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="lg:hidden p-2 rounded-lg text-muted hover:text-ink hover:bg-sage/50 transition-colors" aria-label="Go back">
            <ArrowLeftIcon size={22} />
          </button>
          <h1 className="page-title animate-fade-in">{t('ai.title')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            disabled={isTyping}
            className="px-3 py-1.5 text-sm rounded-lg text-muted hover:text-ink hover:bg-sage/50 transition-colors disabled:opacity-50"
            title="New chat"
            aria-label="Start a new chat"
          >
            New chat
          </button>
        </div>
      </div>
      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 lg:px-8 py-6 flex flex-col">
        {selectedRecipe /* Recipe Detail View */ ? <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden flex-1">
          <div className="p-4 border-b border-line bg-linen flex justify-between items-center">
            <h2 className="font-semibold text-ink">
              {selectedRecipe.mealName}
            </h2>
            <button onClick={() => setSelectedRecipe(null)} className="p-1 rounded-full hover:bg-sage/60" aria-label="Close">
              <XIcon size={18} className="text-muted" />
            </button>
          </div>
          <div className="p-6">
            {selectedRecipe.image && <div className="rounded-xl overflow-hidden h-40 mb-6">
              <img src={selectedRecipe.image} alt={selectedRecipe.mealName} className="w-full h-full object-cover" />
            </div>}
            <div className="mb-6">
              <h3 className="font-medium text-ink mb-2">Ingredients</h3>
              <ul className="space-y-2">
                {selectedRecipe.ingredients.map((ingredient: any, index: number) => <li key={index} className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-herb mr-2"></div>
                  <span>
                    {ingredient.quantity} {ingredient.unit}{' '}
                    {ingredient.name}
                  </span>
                </li>)}
              </ul>
            </div>
            <div className="mb-6">
              <h3 className="font-medium text-ink mb-2">Instructions</h3>
              <ol className="space-y-3">
                {selectedRecipe.instructions.map((step: string, index: number) => <li key={index} className="flex">
                  <div className="bg-sage rounded-full w-6 h-6 flex items-center justify-center text-herb-deep font-medium mr-3 flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-ink">{step}</p>
                </li>)}
              </ol>
            </div>
            <div className="flex gap-2 pt-4">
              <button onClick={() => setSelectedRecipe(null)} className="w-1/2 bg-sage/40 text-ink py-2 rounded-lg">
                Back
              </button>
              <button onClick={() => handleAddToRecipes(selectedRecipe)} className="w-1/2 bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center">
                <PlusCircleIcon size={18} className="mr-1" />
                Add to Recipes
              </button>
            </div>
          </div>
        </div> /* Chat View */ : <>
          <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden flex-1 flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                {messages.map(message => <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] lg:max-w-[70%] rounded-2xl p-3 lg:p-4 ${message.role === 'user' ? 'bg-herb text-white' : message.type === 'error' ? 'bg-sage/50 text-herb-deep border border-line' : 'bg-sage/40 text-ink'}`}>
                    <div>
                      {message.streaming && !message.content ? (
                        <div className="space-y-2">
                          <div className="flex space-x-1.5 py-1">
                            <span className="w-2 h-2 rounded-full bg-muted/70 animate-bounce [animation-delay:0ms]" />
                            <span className="w-2 h-2 rounded-full bg-muted/70 animate-bounce [animation-delay:150ms]" />
                            <span className="w-2 h-2 rounded-full bg-muted/70 animate-bounce [animation-delay:300ms]" />
                          </div>
                          {message.statusText && (
                            <p className="text-xs text-muted">{message.statusText}</p>
                          )}
                        </div>
                      ) : (
                        <>
                          <ChatMessageContent
                            content={message.content}
                            variant={message.role === 'user' ? 'user' : 'assistant'}
                          />
                          {message.streaming && (
                            <span
                              aria-hidden="true"
                              className="inline-block w-0.5 h-[1.1em] ml-0.5 bg-herb align-text-bottom animate-pulse"
                            />
                          )}
                          {message.streaming && message.statusText && (
                            <p className="mt-2 text-xs text-muted">{message.statusText}</p>
                          )}
                        </>
                      )}
                    </div>
                    {message.type === 'recipe_created' && message.cardData && renderRecipeCard(message)}
                    {message.type === 'recipe_imported' && message.cardData && renderRecipeCard(message, 'Imported recipe')}
                    {message.type === 'recipe_updated' && message.cardData && (
                      <div className="mt-3 bg-surface border border-line rounded-xl p-4">
                        <p className="font-medium text-ink">Updated: {message.cardData.recipeName}</p>
                        <button
                          onClick={() => message.cardData?.recipeId && handleViewCreatedRecipe(message.cardData.recipeId)}
                          className="w-full mt-3 bg-sage/40 text-ink py-2 rounded-lg text-sm"
                        >
                          Edit Recipe
                        </button>
                      </div>
                    )}
                    {message.type === 'shopping_list_updated' && message.cardData && (
                      <div className="mt-3 bg-surface border border-line rounded-xl p-4">
                        <p className="font-medium text-ink">
                          Added {message.cardData.itemsAdded ?? 0} items to your shopping list
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {(message.cardData.items ?? []).map((item, index) => (
                            <span key={`${item.name}-${index}`} className="text-xs bg-sage/50 text-herb-deep px-2 py-1 rounded-full">
                              {item.name}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={handleViewShoppingList}
                          className="w-full mt-3 bg-herb text-white py-2 rounded-lg text-sm"
                        >
                          View Shopping List
                        </button>
                      </div>
                    )}
                    {message.type === 'meal_plan_updated' && message.cardData && (
                      <div className="mt-3 bg-surface border border-line rounded-xl p-4">
                        <p className="font-medium text-ink">
                          {message.cardData.mealsScheduled
                            ? `Scheduled ${message.cardData.mealsScheduled} meal(s)`
                            : message.cardData.recipeName
                              ? `${message.cardData.recipeName} — ${message.cardData.mealType} on ${message.cardData.servingDate}`
                              : 'Meal plan updated'}
                        </p>
                        {(message.cardData.meals ?? []).length > 0 && (
                          <ul className="mt-2 text-sm text-muted space-y-1">
                            {message.cardData.meals!.map((meal, index) => (
                              <li key={index}>
                                {meal.meal_name} · {meal.meal_type} · {meal.serving_date}
                              </li>
                            ))}
                          </ul>
                        )}
                        <button onClick={handleViewCalendar} className="w-full mt-3 bg-herb text-white py-2 rounded-lg text-sm">
                          Open Calendar
                        </button>
                      </div>
                    )}
                    {message.type === 'pantry_updated' && message.cardData && (
                      <div className="mt-3 bg-surface border border-line rounded-xl p-4">
                        <p className="font-medium text-ink">
                          {message.cardData.removedDuplicates != null
                            ? `Pantry organized — merged ${message.cardData.mergedGroups ?? 0} group(s)`
                            : `Added ${message.cardData.itemsAdded ?? 0} item(s) to pantry`}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {(message.cardData.items ?? []).map((item, index) => (
                            <span key={`${item.name}-${index}`} className="text-xs bg-sage/50 text-herb-deep px-2 py-1 rounded-full">
                              {item.name}
                            </span>
                          ))}
                        </div>
                        <button onClick={handleViewPantry} className="w-full mt-3 bg-herb text-white py-2 rounded-lg text-sm">
                          Open Pantry
                        </button>
                      </div>
                    )}
                    {message.type === 'preferences_updated' && message.cardData && (
                      <div className="mt-3 bg-surface border border-line rounded-xl p-4">
                        <p className="font-medium text-ink mb-2">Preferences saved</p>
                        <div className="text-sm text-muted space-y-1">
                          {message.cardData.allergies?.length ? (
                            <p>Allergies: {message.cardData.allergies.join(', ')}</p>
                          ) : null}
                          {message.cardData.dietaryRestrictions?.length ? (
                            <p>Diet: {message.cardData.dietaryRestrictions.join(', ')}</p>
                          ) : null}
                          {message.cardData.householdNotes ? (
                            <p>Household: {message.cardData.householdNotes}</p>
                          ) : null}
                        </div>
                      </div>
                    )}
                    {message.type === 'meal_suggestions' && message.cardData && (
                      <div className="mt-3 bg-surface border border-line rounded-xl p-4">
                        <p className="font-medium text-ink mb-2">Meal suggestions</p>
                        <ul className="space-y-2">
                          {(message.cardData.suggestions ?? []).map((s, index) => (
                            <li key={index} className="text-sm text-ink flex justify-between">
                              <span>{s.recipeName}</span>
                              <span className="text-muted">{s.matchScore}% match</span>
                            </li>
                          ))}
                        </ul>
                        <button onClick={handleViewCalendar} className="w-full mt-3 bg-sage/40 text-ink py-2 rounded-lg text-sm">
                          View Calendar
                        </button>
                      </div>
                    )}
                    {message.type === 'multi_action' && message.cardData && (
                      <div className="mt-3 bg-surface border border-line rounded-xl p-4">
                        <p className="font-medium text-ink">
                          Completed {message.cardData.actionCount ?? 0} action(s)
                        </p>
                        <ul className="mt-2 text-sm text-muted space-y-1">
                          {(message.cardData.actions ?? []).map((action, index) => (
                            <li key={index}>{String(action.message ?? action.tool ?? 'Action')}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-white/70' : message.type === 'error' ? 'text-herb' : 'text-muted'}`}>
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>)}
                {/* Show suggested recipes if available */}
                {suggestedRecipes.length > 0 && <div className="flex justify-start">
                  <div className="max-w-[80%] bg-surface border border-line rounded-2xl p-4 shadow-sm">
                    <h3 className="font-medium text-ink mb-2">
                      Suggested Recipes
                    </h3>
                    <div className="space-y-3">
                      {suggestedRecipes.map(recipe => <div key={recipe.id} className="border border-line rounded-lg p-3 hover:bg-linen">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-ink">
                            {recipe.mealName}
                          </h4>
                          <div className="flex space-x-1">
                            <button onClick={() => setSelectedRecipe(recipe)} className="p-1 rounded-full hover:bg-sage/60 text-muted" title="View recipe">
                              <ChevronRightIcon size={16} />
                            </button>
                          </div>
                        </div>
                        {recipe.missingIngredient && <div className="flex items-center text-muted text-xs">
                          <ShoppingCartIcon size={12} className="mr-1" />
                          <span>
                            Missing: {recipe.missingIngredient.name}
                          </span>
                        </div>}
                      </div>)}
                    </div>
                  </div>
                </div>}
                <div ref={messagesEndRef} />
              </div>
            </div>
            {/* Input Area */}
            <div className="border-t border-line p-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearChat}
                  disabled={isTyping}
                  className="p-2 text-muted hover:text-ink hover:bg-sage/50 rounded-full disabled:opacity-50"
                  title="New chat"
                  aria-label="Start a new chat"
                >
                  <RefreshCwIcon size={20} />
                </button>
                <div className="relative flex-1">
                  <input ref={inputRef} type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }} placeholder="Ask LarderMind to plan, import, or organize..." className="w-full py-3 px-4 pr-12 border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-herb/30 focus:border-transparent" disabled={isTyping} />
                  <button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping} aria-label="Send message" className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-herb hover:text-herb-deep disabled:text-muted">
                    <SendIcon size={20} />
                  </button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 justify-center">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button key={prompt} onClick={() => setInputValue(prompt)} className="text-xs bg-sage/40 hover:bg-sage/60 text-ink px-3 py-1 rounded-full">
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>}
      </main>
    </div></div>;
}