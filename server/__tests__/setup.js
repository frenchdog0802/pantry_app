// Test setup file
// Add any global test setup here
import { jest, afterEach } from '@jest/globals';

// Suppress console logs during tests unless debugging
if (process.env.DEBUG !== 'true') {
    global.console = {
        ...console,
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        // Keep error for debugging failed tests
        error: console.error,
    };
}

// Clean up after each test
afterEach(() => {
    jest.clearAllMocks();
});
