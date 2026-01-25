export default {
    testEnvironment: 'node',
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    moduleFileExtensions: ['js'],
    testMatch: ['**/__tests__/**/*.test.js'],
    collectCoverageFrom: [
        'services/**/*.js',
        'routes/**/*.js',
        'middleware/**/*.js',
        '!**/node_modules/**',
    ],
    coverageDirectory: 'coverage',
    verbose: true,
    setupFilesAfterEnv: ['./__tests__/setup.js'],
    testTimeout: 10000,
};
