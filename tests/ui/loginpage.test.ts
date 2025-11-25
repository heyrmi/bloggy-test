import { FileUtils } from '@/lib/utils/FileUtils';
import test from '@lib/BaseTest';
import { expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.describe('Login Page', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.goto();
    });

    test.describe('Login Form Testing', () => {
        test('should display login page', async ({ loginPage }) => {
            await expect(loginPage.adminHeading).toBeVisible();
        });

        test('should display login form', async ({ loginPage }) => {
            await expect(loginPage.username).toBeVisible();
            await expect(loginPage.password).toBeVisible();
            await expect(loginPage.loginButton).toBeVisible();
        });

        test('should display register form', async ({ loginPage }) => {
            await loginPage.registerTab.click();
            await expect(loginPage.username).toBeVisible();
            await expect(loginPage.password).toBeVisible();
            await expect(loginPage.registerButton).toBeVisible();
        });
    });

    test.describe('Login Testing', () => {
        test('should login with valid credentials', async ({ loginPage }) => {
            const loginData = FileUtils.readJsonFile<{ loginValid: { username: string; password: string } }>('testData/login.json');
            await loginPage.login(loginData.loginValid.username, loginData.loginValid.password);
            await expect(loginPage.adminHeading).toHaveText('Blog Management');
            await expect(loginPage.page).toHaveURL(/.*admin/);
        });

        test('should login with invalid credentials', async ({ loginPage }) => {
            const loginData = FileUtils.readJsonFile<{ loginInvalid: { username: string; password: string } }>('testData/login.json');
            await loginPage.login(loginData.loginInvalid.username, loginData.loginInvalid.password);
            await expect(loginPage.errorMessage).toHaveText('Invalid credentials');
        });
    });

    test.describe('Register Testing', () => {
        test('should handle registration scenarios', async ({ loginPage, homePage }) => {
            const username = faker.internet.username();
            const password = faker.internet.password();

            // 1. Register with valid credentials
            await test.step('register with valid credentials', async () => {
                await loginPage.register(username, password);
                await expect(loginPage.adminHeading).toHaveText('Blog Management');
                await expect(loginPage.page).toHaveURL(/.*admin/);
                await homePage.clickLogout();
            });

            // 2. Register with same username
            await test.step('register with same username', async () => {
                await loginPage.goto();
                await loginPage.register(username, password);
                await expect(loginPage.errorMessage).toHaveText('Username already exists');
            });
        });

        // 3. Register with invalid credentials
        test('should register with invalid credentials', async ({ loginPage }) => {
            const loginData = FileUtils.readJsonFile<{ registerInvalid: { username: string; password: string } }>('testData/login.json');
            await loginPage.register(loginData.registerInvalid.username, loginData.registerInvalid.password);
            await expect(loginPage.errorMessage).toHaveText('Password must be at least 6 characters');
        });
    });

});
