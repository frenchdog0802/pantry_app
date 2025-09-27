export type User = { id: string; email: string; name: string; token?: string };

export interface IngredientEntry {
    name: string;
    quantity: number;
    unit: string;
}

export interface RecipeSuggestion {
    id: number;
    name: string;
    ingredients: { name: string; quantity: number; unit: string }[];
    image?: string | null;
    cookTime?: number;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    instructions?: string[];
    swaps?: { original: string; alternative: string }[];
}
export interface Recipe {
    id: string;
    mealName: string;
    mealType: string;
    date: string;
    ingredients: {
        name: string;
        quantity: number;
        unit: string;
    }[];
    image?: string | null;
}
export type CookingHistoryItem = {
    id: string;
    date: string;
    recipeId: Recipe['id'];
    recipeName: string;
    type?: string;
    image?: string | null;
};
export type ShoppingListItem = {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    purchased: boolean;
};


export interface MealInfo {
    name: string;
    type: string;
}

export interface PantryItem {
    name: string;
    quantity: number;
    unit: string;
    expiryDate?: string; // Optional expiry date
}