/**
 * Mock utilities for testing
 * Provides mock implementations for Express req/res and database models
 */
import { jest } from '@jest/globals';

// Mock Express request object
export const mockRequest = (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    auth: { user_id: 'test-user-id' },
    get: jest.fn(),
    ...overrides,
});

// Mock Express response object
export const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
};

// Mock next function for middleware
export const mockNext = jest.fn();

// Factory for creating mock Mongoose documents
export const mockMongooseDocument = (data) => ({
    ...data,
    _id: data._id || 'mock-id',
    save: jest.fn().mockResolvedValue(data),
    toObject: jest.fn().mockReturnValue(data),
    toJSON: jest.fn().mockReturnValue(data),
});

// Helper to create mock Mongoose model
export const createMockModel = (defaultData = {}) => {
    const MockModel = jest.fn().mockImplementation((data) => mockMongooseDocument({ ...defaultData, ...data }));

    MockModel.find = jest.fn().mockResolvedValue([]);
    MockModel.findOne = jest.fn().mockResolvedValue(null);
    MockModel.findById = jest.fn().mockResolvedValue(null);
    MockModel.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
    MockModel.findByIdAndDelete = jest.fn().mockResolvedValue(null);
    MockModel.create = jest.fn().mockResolvedValue(mockMongooseDocument(defaultData));
    MockModel.insertMany = jest.fn().mockResolvedValue([]);
    MockModel.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 0 });
    MockModel.countDocuments = jest.fn().mockResolvedValue(0);

    return MockModel;
};

// Sample test data factories
export const testData = {
    user: (overrides = {}) => ({
        _id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        password_hash: 'hashed-password',
        role: 'user',
        ...overrides,
    }),

    recipe: (overrides = {}) => ({
        _id: 'recipe-123',
        user_id: 'user-123',
        meal_name: 'Test Recipe',
        instructions: 'Test instructions',
        image: 'http://example.com/image.jpg',
        ...overrides,
    }),

    ingredient: (overrides = {}) => ({
        _id: 'ingredient-123',
        name: 'Test Ingredient',
        default_unit: 'g',
        ...overrides,
    }),

    mealPlan: (overrides = {}) => ({
        _id: 'mealplan-123',
        user_id: 'user-123',
        recipe_id: 'recipe-123',
        meal_type: 'lunch',
        serving_date: Math.floor(Date.now() / 1000),
        ...overrides,
    }),

    subscriptionPlan: (overrides = {}) => ({
        _id: 'plan-123',
        name: 'Pro Monthly',
        billing_period: 'monthly',
        price_cents: 999,
        currency: 'usd',
        is_active: true,
        ...overrides,
    }),
};
