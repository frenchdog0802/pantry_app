import { api } from './Client';
import type { PantryItem } from './Types';

export const PantryItemApi = {
    list: () => api.get<PantryItem[]>('/api/pantry-item'),
    // Get a single recipe by ID
    get: (id: string | number) => api.get<PantryItem>(`/api/pantry-item/${id}`),

    // Create a new recipe
    create: (data: Partial<PantryItem>) => api.post<PantryItem>('/api/pantry-item', data),

    // Update an existing recipe by ID
    update: (id: string | number, data: Partial<PantryItem>) => api.put<PantryItem>(`/api/pantry-item/${id}`, data),

    // Delete a recipe by ID
    delete: (id: string | number) => api.delete<void>(`/api/pantry-item/${id}`),
};
