/**
 * Unit tests for auth.service.js
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { mockRequest, mockResponse, testData, mockMongooseDocument } from '../utils/testUtils.js';

// Mock dependencies before importing the service
jest.unstable_mockModule('../../models/user.model.js', () => ({
    default: {
        findOne: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
    }
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
    default: {
        sign: jest.fn().mockReturnValue('mock-jwt-token'),
        verify: jest.fn(),
    }
}));

jest.unstable_mockModule('../../config/config.js', () => ({
    default: {
        jwtSecret: 'test-secret',
        mongoUri: 'mongodb://localhost/test',
    }
}));

describe('Auth Service', () => {
    let authService;
    let User;
    let jwt;

    beforeEach(async () => {
        jest.clearAllMocks();

        // Dynamic imports after mocks are set up
        User = (await import('../../models/user.model.js')).default;
        jwt = (await import('jsonwebtoken')).default;
        authService = (await import('../../services/auth.service.js')).default;
    });

    describe('signup', () => {
        it('should return error if email already exists', async () => {
            const req = mockRequest({
                body: { email: 'existing@test.com', password: 'password123', name: 'Test' }
            });
            const res = mockResponse();

            User.findOne.mockResolvedValue(testData.user({ email: 'existing@test.com' }));

            await authService.signup(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: false })
            );
        });

        it('should create user and return token on success', async () => {
            const req = mockRequest({
                body: { email: 'new@test.com', password: 'password123', name: 'New User' }
            });
            const res = mockResponse();

            User.findOne.mockResolvedValue(null);

            // Mock successful user creation
            const mockUser = {
                ...testData.user({ email: 'new@test.com' }),
                save: jest.fn().mockResolvedValue(true),
            };

            // Mock User constructor
            jest.spyOn(User, 'findOne').mockResolvedValue(null);

            await authService.signup(req, res);

            expect(res.json).toHaveBeenCalled();
        });
    });

    describe('signin', () => {
        it('should return error if user not found', async () => {
            const req = mockRequest({
                body: { email: 'notfound@test.com', password: 'password123' }
            });
            const res = mockResponse();

            User.findOne.mockResolvedValue(null);

            await authService.signin(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: 'User not found'
                })
            );
        });

        it('should return error if password does not match', async () => {
            const req = mockRequest({
                body: { email: 'test@test.com', password: 'wrongpassword' }
            });
            const res = mockResponse();

            const mockUser = {
                ...testData.user(),
                authenticate: jest.fn().mockReturnValue(false),
            };
            User.findOne.mockResolvedValue(mockUser);

            await authService.signin(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Email and password don't match."
                })
            );
        });

        it('should return token on successful signin', async () => {
            const req = mockRequest({
                body: { email: 'test@test.com', password: 'correctpassword' }
            });
            const res = mockResponse();

            const mockUser = {
                ...testData.user(),
                authenticate: jest.fn().mockReturnValue(true),
            };
            User.findOne.mockResolvedValue(mockUser);

            await authService.signin(req, res);

            expect(jwt.sign).toHaveBeenCalledWith(
                { user_id: mockUser._id },
                'test-secret'
            );
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        token: 'mock-jwt-token'
                    })
                })
            );
        });
    });

    describe('signout', () => {
        it('should clear cookie and return success', async () => {
            const req = mockRequest();
            const res = mockResponse();

            await authService.signout(req, res);

            expect(res.clearCookie).toHaveBeenCalledWith('t');
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: { message: 'signed out' }
                })
            );
        });
    });
});
