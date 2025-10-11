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
    createdAt: number;
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