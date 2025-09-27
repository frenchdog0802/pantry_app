import { api } from './client';
import type { PantryItem } from './types';

export const pantryApi = {
    list: () => api.get<PantryItem[]>('/pantry'),
    replaceAll: (items: PantryItem[]) => api.put<PantryItem[]>('/pantry', items),
    // 若有單筆 CRUD，就另外做：
    upsert: (item: PantryItem) => api.post<PantryItem>('/pantry', item),
    delete: (name: string) => api.delete<void>(`/pantry/${encodeURIComponent(name)}`),
};
