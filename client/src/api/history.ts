import { api } from './client';
import type { CookingHistoryItem } from './types';

export const historyApi = {
    list: () => api.get<CookingHistoryItem[]>('/api/history'),
    add: (h: Omit<CookingHistoryItem, 'id'>) => api.post<CookingHistoryItem>('/history', h),
};
