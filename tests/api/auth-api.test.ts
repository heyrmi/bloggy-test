import { testConfig } from '@/testConfig';
import { testData } from '@/testData/testData';
import test from '@lib/BaseTest';
import { expect } from '@playwright/test';
import * as allure from 'allure-js-commons';

test.describe('Authentication API Tests', () => {
    const apiUrl = testConfig.apiUrl;
    const loginData = testData.loginData;

    test.describe('POST /api/auth/login', () => {
        test('should successfully login with valid credentials', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Authentication');
            allure.story('Login');
            allure.description('Verify that user can login with valid credentials');

            const response = await apiActions.post(`${apiUrl}/api/auth/login`, loginData.loginValid);

            // Verify response
            await apiActions.verifyStatusCode(response, 200);
            await apiActions.verifyResponseHeaders(response, ['content-type']);
            await apiActions.verifyResponseBodyFields(response, ['token', 'user', 'user.id', 'user.username']);

            const body = await apiActions.getResponseJson<any>(response);
            expect(body.token).toBeTruthy();
            expect(body.user.username).toBe(loginData.loginValid.username);
            expect(body.user).toHaveProperty('createdAt');
        });

        test('should fail login with invalid password', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Authentication');
            allure.story('Login');
            allure.description('Verify that login fails with invalid password');

            const response = await apiActions.post(`${apiUrl}/api/auth/login`, loginData.loginInvalid);

            await apiActions.verifyStatusCode(response, 401);
            await apiActions.verifyResponseBodyFields(response, ['error']);

            const body = await apiActions.getResponseJson<any>(response);
            expect(body.error).toBe('Invalid credentials');
        });

        test('should fail login with missing username', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Authentication');
            allure.story('Login');
            allure.description('Verify that login fails when username is missing');

            const response = await apiActions.post(`${apiUrl}/api/auth/login`, {
                password: 'test123'
            });

            await apiActions.verifyStatusCode(response, 400);
            await apiActions.verifyResponseBodyFields(response, ['error']);

            const body = await apiActions.getResponseJson<any>(response);
            expect(body.error).toBe('Username and password are required');
        });

        test('should fail login with missing password', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Authentication');
            allure.story('Login');
            allure.description('Verify that login fails when password is missing');

            const response = await apiActions.post(`${apiUrl}/api/auth/login`, {
                username: 'testuser'
            });

            await apiActions.verifyStatusCode(response, 400);
            await apiActions.verifyResponseBodyFields(response, ['error']);

            const body = await apiActions.getResponseJson<any>(response);
            expect(body.error).toBe('Username and password are required');
        });

        test('should fail login with non-existent user', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Authentication');
            allure.story('Login');
            allure.description('Verify that login fails with non-existent username');

            const response = await apiActions.post(`${apiUrl}/api/auth/login`, {
                username: 'nonexistentuser12345',
                password: 'password123'
            });

            await apiActions.verifyStatusCode(response, 401);
            await apiActions.verifyResponseBodyFields(response, ['error']);
        });
    });

    test.describe('POST /api/auth/register', () => {
        test('should successfully register a new user', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Authentication');
            allure.story('Registration');
            allure.description('Verify that new user can register successfully');

            const timestamp = Date.now();
            const newUser = {
                username: `testuser_${timestamp}`,
                password: 'testpass123'
            };

            const response = await apiActions.post(`${apiUrl}/api/auth/register`, newUser);

            await apiActions.verifyStatusCode(response, 201);
            await apiActions.verifyResponseBodyFields(response, ['token', 'user', 'user.id', 'user.username']);

            const body = await apiActions.getResponseJson<any>(response);
            expect(body.token).toBeTruthy();
            expect(body.user.username).toBe(newUser.username);
            expect(body.user).toHaveProperty('createdAt');
        });

        test('should fail registration with existing username', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Authentication');
            allure.story('Registration');
            allure.description('Verify that registration fails when username already exists');

            const response = await apiActions.post(`${apiUrl}/api/auth/register`, loginData.loginValid);

            await apiActions.verifyStatusCode(response, 409);
            await apiActions.verifyResponseBodyFields(response, ['error']);

            const body = await apiActions.getResponseJson<any>(response);
            expect(body.error).toBe('Username already exists');
        });

        test('should fail registration with password less than 6 characters', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Authentication');
            allure.story('Registration');
            allure.description('Verify that registration fails with short password');

            const response = await apiActions.post(`${apiUrl}/api/auth/register`, loginData.registerInvalid);

            await apiActions.verifyStatusCode(response, 400);
            await apiActions.verifyResponseBodyFields(response, ['error']);

            const body = await apiActions.getResponseJson<any>(response);
            expect(body.error).toBe('Password must be at least 6 characters');
        });

        test('should fail registration with missing username', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Authentication');
            allure.story('Registration');
            allure.description('Verify that registration fails when username is missing');

            const response = await apiActions.post(`${apiUrl}/api/auth/register`, {
                password: 'password123'
            });

            await apiActions.verifyStatusCode(response, 400);
            await apiActions.verifyResponseBodyFields(response, ['error']);

            const body = await apiActions.getResponseJson<any>(response);
            expect(body.error).toBe('Username and password are required');
        });

        test('should fail registration with missing password', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Authentication');
            allure.story('Registration');
            allure.description('Verify that registration fails when password is missing');

            const response = await apiActions.post(`${apiUrl}/api/auth/register`, {
                username: 'newuser'
            });

            await apiActions.verifyStatusCode(response, 400);
            await apiActions.verifyResponseBodyFields(response, ['error']);

            const body = await apiActions.getResponseJson<any>(response);
            expect(body.error).toBe('Username and password are required');
        });
    });
});

