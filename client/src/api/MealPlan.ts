import { api } from './Client';
import { MealPlan } from './Types';

export const mealPlanApi = {
    // List all meal plans, optionally filtered by query
    list: (query?: string) => api.get<MealPlan[]>(query ? `/api/meal-plan?query=${encodeURIComponent(query)}` : '/api/meal-plan'),

    // Get a single meal plan by ID
    get: (id: string | number) => api.get<MealPlan>(`/api/meal-plan/${id}`),

    // Create a new meal plan
    create: (data: Partial<MealPlan>) => api.post<MealPlan>('/api/meal-plan', data),

    // Update an existing meal plan by ID
    update: (id: string | number, data: Partial<MealPlan>) => api.put<MealPlan>(`/api/meal-plan/${id}`, data),

    // Delete a meal plan by ID
    delete: (id: string | number) => api.delete<void>(`/api/meal-plan/${id}`),
};