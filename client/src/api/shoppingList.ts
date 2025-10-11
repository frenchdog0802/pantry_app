import { api } from './Client';
import { ShoppingListItem } from './Types';

export const shoppingListApi = {
    // List all shopping list items, optionally filtered by query
    list: (query?: string) => api.get<ShoppingListItem[]>(query ? `/api/shopping-list?query=${encodeURIComponent(query)}` : '/api/shopping-list'),

    // Get a single shopping list item by ID
    get: (id: string | number) => api.get<ShoppingListItem>(`/api/shopping-list/${id}`),

    // Create a new shopping list item
    create: (data: Partial<ShoppingListItem>) => api.post<ShoppingListItem>('/api/shopping-list', data),

    // Update an existing shopping list item by ID
    update: (id: string | number, data: Partial<ShoppingListItem>) => api.put<ShoppingListItem>(`/api/shopping-list/${id}`, data),

    // Delete a shopping list item by ID
    delete: (id: string | number) => api.delete<void>(`/api/shopping-list/${id}`),
};