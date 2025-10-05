import { api } from './Client';
import type { CookingHistoryItem } from './Types';

export const historyApi = {
    list: () => api.get<CookingHistoryItem[]>('/api/history'),
    add: (h: Omit<CookingHistoryItem, 'id'>) => api.post<CookingHistoryItem>('/history', h),
};
