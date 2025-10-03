export type User = { id: string; email: string; name: string; token?: string };

export interface UserSettings {
    name: string;
    language: string;
    measurementUnit: string;
}

export interface IngredientEntry {
    name: string;
    quantity: number;
    unit: string;
}

export interface Folder {
    id: string;
    name: string;
    icon: string;
    createdAt: number;
}

export interface RecipeSuggestion {
    id: string;
    mealName: string;
    ingredients: {
        name: string;
        quantity: number;
        unit: string;
    }[];
    instructions: string[];
    cookTime?: number;
    difficulty?: string;
    image?: string;
    savedAt?: number;
    missingIngredient?: IngredientEntry;
}
export interface Recipe {
    id: string;
    folderId: string;
    mealName: string;
    instructions: string[];
    cookTime?: number;
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
}