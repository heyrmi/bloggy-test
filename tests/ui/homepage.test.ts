import test from '@lib/BaseTest';
import { expect } from '@playwright/test';

test.describe('Homepage Tests', () => {
    test.beforeEach(async ({ homePage }) => {
        await homePage.goto();
    });

    test.describe('Header Testing', () => {
        test('should display all header elements', async ({ homePage }) => {
            await expect(homePage.logoBlogApp).toBeVisible();
            await expect(homePage.homeButton).toBeVisible();
            await expect(homePage.darkModeButton).toBeVisible();
        });

        test('should be able to toggle dark mode', async ({ homePage }) => {
            // Verify initial state (light mode)
            await expect(homePage.darkModeButton).toHaveAttribute('title', 'Switch to dark mode');

            // Toggle to dark mode
            await homePage.clickDarkModeToggle();
            await expect(homePage.darkModeButton).toHaveAttribute('title', 'Switch to light mode');

            // Toggle back to light mode
            await homePage.clickDarkModeToggle();
            await expect(homePage.darkModeButton).toHaveAttribute('title', 'Switch to dark mode');
        });

        test('should navigate to admin login', async ({ homePage }) => {
            await homePage.clickAdminLogin();
            await expect(homePage.page).toHaveURL(/.*login/);
        });
    });

    test.describe('Main Content Testing', () => {
        test('should display main heading', async ({ homePage }) => {
            await expect(homePage.pageMainHeading).toHaveText('Welcome to Our Blog');
        });

        test('should be able to search for blogs', async ({ homePage }) => {
            const searchTerm = 'React';
            await homePage.searchBlogs(searchTerm);
        });

        test.skip('should be able to filter by category', async ({ homePage }) => {
            await homePage.selectCategory('Programming');
            // Add assertions for filtered results
        });
    });

    test.describe('Login Page Opening', () => {
        test('should navigate to login page', async ({ homePage }) => {
            await homePage.clickAdminLogin();
            await expect(homePage.page).toHaveURL(/.*login/);
        });
    });
});