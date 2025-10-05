import { api } from './Client';
import type { ShoppingListItem } from './Types';

export const shoppingApi = {
    list: () => api.get<ShoppingListItem[]>('/shopping-list'),
    add: (item: Omit<ShoppingListItem, 'id' | 'purchased'>) =>
        api.post<ShoppingListItem>('/shopping-list', item),
    replaceAll: (items: ShoppingListItem[]) =>
        api.put<ShoppingListItem[]>('/shopping-list', items),
    togglePurchased: (id: string, purchased: boolean) =>
        api.patch<ShoppingListItem>(`/shopping-list/${id}`, { purchased }),
    delete: (id: string) => api.delete<void>(`/shopping-list/${id}`),
};
