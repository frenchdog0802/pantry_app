import { api } from './client';
import type { PantryItem } from './types';

export const PantryItemApi = {
    list: () => api.get<PantryItem[]>('/api/pantry-item'),
    // Get a single recipe by ID
    get: (id: string | number) => api.get<PantryItem>(`/api/pantry-item/${id}`),

    // Create a new recipe
    create: (data: Partial<PantryItem>) => api.post<PantryItem>('/api/pantry-item', data),

    // Update an existing recipe by ID
    update: (id: string | number, data: Partial<PantryItem>) => api.put<PantryItem>(`/api/pantry-item/${id}`, data),

    // Bulk update many pantry items
    updateMany: (items: Array<Pick<PantryItem, 'id'> & Partial<PantryItem>>) => api.put<PantryItem[]>(`/api/pantry-item/bulk`, items),

    // Delete a recipe by ID
    delete: (id: string | number) => api.delete<void>(`/api/pantry-item/${id}`),
};
