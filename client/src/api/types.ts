export type User = { id: string; email: string; name: string; token?: string };

export interface UserSettings {
    name: string;
    language: string;
    measurementUnit: string;
}

export interface IngredientEntry {
    id: string;
    name: string;
    quantity: number;
    unit: string;
}

export interface Folder {
    id: string;
    name: string;
    icon: string;
}

export interface Recipe {
    id: string;
    folder_id: string;
    meal_name: string;
    instructions: string[];
    ingredients: {
        name: string;
        quantity: number;
        unit: string;
    }[];
    image?: string | null;
}

export type ShoppingListItem = {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    checked: boolean;
};


export interface PantryItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
}

export interface MealPlan {
    id: string;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    serving_date: string; // YYYY-MM-DD
    recipe_id: string;
    meal_name: string;
    image?: string | null;
}