import test from '@lib/BaseTest';
import { expect } from '@playwright/test';

test.describe('Session Persistence Tests', () => {
    test.describe('Theme Persistence Across Sessions', () => {
        test('should persist dark mode preference across browser sessions', async ({ page, context, homePage }) => {
            await test.step('navigate to homepage and verify light mode', async () => {
                await homePage.goto();
                await expect(homePage.darkModeButton).toHaveAttribute('title', 'Switch to dark mode');

                // Verify initial themeMode is light
                const isDarkMode = await page.evaluate((): boolean => {
                    return window.localStorage.getItem('themeMode') === 'dark';
                });
                expect(isDarkMode).toBe(false);
            });

            await test.step('switch to dark mode', async () => {
                await homePage.clickDarkModeToggle();
                await expect(homePage.darkModeButton).toHaveAttribute('title', 'Switch to light mode');

                // Validate dark mode using localStorage
                const isDarkMode = await page.evaluate((): boolean => {
                    return window.localStorage.getItem('themeMode') === 'dark';
                });
                expect(isDarkMode).toBe(true);
            });

            await test.step('close and reopen browser with stored context', async () => {
                // Get current storage state
                const storageState = await context.storageState();

                // Create a new page with the same storage state
                const newContext = await page.context().browser()!.newContext({
                    storageState
                });
                const newPage = await newContext.newPage();

                // Navigate to homepage with new page
                await newPage.goto(homePage.page.url());
                await newPage.waitForLoadState('load');

                // Verify dark mode persists using localStorage
                const isDarkMode = await newPage.evaluate((): boolean => {
                    return window.localStorage.getItem('themeMode') === 'dark';
                });
                expect(isDarkMode).toBe(true);

                // Also verify the UI reflects dark mode
                const darkModeButton = newPage.getByRole('button', { name: /switch to/i });
                await expect(darkModeButton).toHaveAttribute('title', 'Switch to light mode');

                // Close the new context
                await newContext.close();
            });
        });

        test('should persist light mode preference across browser sessions', async ({ page, context, homePage }) => {
            await test.step('navigate to homepage', async () => {
                await homePage.goto();
            });

            await test.step('switch to dark mode first', async () => {
                await homePage.clickDarkModeToggle();
                await expect(homePage.darkModeButton).toHaveAttribute('title', 'Switch to light mode');

                // Verify dark mode is set
                const isDarkMode = await page.evaluate((): boolean => {
                    return window.localStorage.getItem('themeMode') === 'dark';
                });
                expect(isDarkMode).toBe(true);
            });

            await test.step('switch back to light mode', async () => {
                await homePage.clickDarkModeToggle();
                await expect(homePage.darkModeButton).toHaveAttribute('title', 'Switch to dark mode');

                // Verify light mode is set
                const isDarkMode = await page.evaluate((): boolean => {
                    return window.localStorage.getItem('themeMode') === 'dark';
                });
                expect(isDarkMode).toBe(false);
            });

            await test.step('verify light mode persists in new session', async () => {
                const storageState = await context.storageState();
                const newContext = await page.context().browser()!.newContext({
                    storageState
                });
                const newPage = await newContext.newPage();

                await newPage.goto(homePage.page.url());
                await newPage.waitForLoadState('load');

                // Verify light mode persists using localStorage
                const isDarkMode = await newPage.evaluate((): boolean => {
                    return window.localStorage.getItem('themeMode') === 'dark';
                });
                expect(isDarkMode).toBe(false);

                // Also verify the UI
                const darkModeButton = newPage.getByRole('button', { name: /switch to/i });
                await expect(darkModeButton).toHaveAttribute('title', 'Switch to dark mode');

                await newContext.close();
            });
        });

        test('should sync theme across multiple tabs in same session', async ({ context, homePage }) => {
            await test.step('open first tab and set dark mode', async () => {
                await homePage.goto();
                await homePage.clickDarkModeToggle();
                await expect(homePage.darkModeButton).toHaveAttribute('title', 'Switch to light mode');

                // Verify dark mode in first tab
                const themeMode = await homePage.page.evaluate(() => localStorage.getItem('themeMode'));
                expect(themeMode).toBe('dark');
            });

            await test.step('open second tab and verify theme is synced', async () => {
                const secondPage = await context.newPage();
                await secondPage.goto(homePage.page.url());
                await secondPage.waitForLoadState('load');

                // Check localStorage in the second tab
                const isDarkMode = await secondPage.evaluate((): boolean => {
                    return window.localStorage.getItem('themeMode') === 'dark';
                });
                expect(isDarkMode).toBe(true);

                // Also verify the UI
                const darkModeButton = secondPage.getByRole('button', { name: /switch to/i });
                await expect(darkModeButton).toHaveAttribute('title', 'Switch to light mode');

                await secondPage.close();
            });
        });
    });

    test.describe('Read Blogs Visual Marking Persistence', () => {
        test('should mark blog as read and persist across sessions', async ({ page, context, homePage, publishedBlogPage }) => {
            let blogUrl: string;
            let blogTitle: string;

            await test.step('navigate to homepage and select a blog', async () => {
                await homePage.goto();
                await homePage.waitForBlogCardsToLoad();

                const firstBlogCard = await homePage.getBlogCardByIndex(0);

                const isReadBefore = await homePage.hasReadBadge(firstBlogCard);
                expect(isReadBefore).toBe(false);

                blogTitle = await homePage.getBlogCardTitle(firstBlogCard);
                expect(blogTitle).toBeTruthy();

                await homePage.clickReadMoreOnCard(firstBlogCard);
                await publishedBlogPage.waitForPageLoad();

                blogUrl = page.url();
            });

            await test.step('verify blog is displayed and read', async () => {
                await page.goto(blogUrl);
                await expect(publishedBlogPage.blogTitle).toBeVisible();
                await page.waitForTimeout(1000);
            });

            await test.step('go back to homepage and verify read badge', async () => {
                await homePage.goto();
                await homePage.waitForBlogCardsToLoad();

                const firstBlogCard = await homePage.getBlogCardByIndex(0);

                const hasReadBadgeNow = await homePage.hasReadBadge(firstBlogCard);
                expect(hasReadBadgeNow).toBe(true);

                const readBlogs = await homePage.getReadBlogsFromStorage();
                expect(readBlogs.length).toBeGreaterThan(0);
            });

            await test.step('open new browser session and verify read status persists', async () => {
                const storageState = await context.storageState();
                const newContext = await page.context().browser()!.newContext({
                    storageState
                });
                const newPage = await newContext.newPage();

                await newPage.goto(homePage.page.url());
                await newPage.waitForLoadState('load');

                await newPage.locator('.MuiCard-root').first().waitFor({ state: 'visible', timeout: 10000 });

                const firstCard = newPage.locator('.MuiCard-root').first();
                const readBadge = firstCard.locator('.MuiChip-colorSuccess:has-text("Read")');
                await expect(readBadge).toBeVisible();

                const persistedReadBlogs = await newPage.evaluate(() => {
                    const stored = localStorage.getItem('readBlogs');
                    return stored ? JSON.parse(stored) : [];
                });
                expect(persistedReadBlogs.length).toBeGreaterThan(0);

                await newContext.close();
            });
        });

        test('should track multiple read blogs across sessions', async ({ page, context, homePage, publishedBlogPage }) => {
            const readBlogTitles: string[] = [];

            await test.step('read multiple blogs', async () => {
                await homePage.goto();
                await homePage.waitForBlogCardsToLoad();

                const blogsToRead = 3; // Read 3 blogs

                for (let i = 0; i < blogsToRead; i++) {
                    await homePage.goto();
                    await homePage.waitForBlogCardsToLoad();

                    const blogCard = await homePage.getBlogCardByIndex(i);
                    const title = await homePage.getBlogCardTitle(blogCard);
                    readBlogTitles.push(title);

                    await homePage.clickReadMoreOnCard(blogCard);
                    await publishedBlogPage.waitForPageLoad();

                    await page.waitForTimeout(500);
                }

                expect(readBlogTitles.length).toBe(blogsToRead);
            });

            await test.step('verify all blogs are marked as read', async () => {
                await homePage.goto();
                await homePage.waitForBlogCardsToLoad();

                const readBlogs = await homePage.getReadBlogsFromStorage();
                expect(readBlogs.length).toBe(3);

                for (let i = 0; i < 3; i++) {
                    const card = await homePage.getBlogCardByIndex(i);
                    const hasReadBadge = await homePage.hasReadBadge(card);
                    expect(hasReadBadge).toBe(true);
                }
            });

            await test.step('verify all read blogs persist in new session', async () => {
                const storageState = await context.storageState();
                const newContext = await page.context().browser()!.newContext({
                    storageState
                });
                const newPage = await newContext.newPage();

                await newPage.goto(homePage.page.url());
                await newPage.waitForLoadState('load');
                await newPage.locator('.MuiCard-root').first().waitFor({ state: 'visible' });

                const persistedReadBlogs = await newPage.evaluate(() => {
                    const stored = localStorage.getItem('readBlogs');
                    return stored ? JSON.parse(stored) : [];
                });
                expect(persistedReadBlogs.length).toBe(3);

                const cards = newPage.locator('.MuiCard-root');
                for (let i = 0; i < 3; i++) {
                    const card = cards.nth(i);
                    const readBadge = card.locator('.MuiChip-colorSuccess:has-text("Read")');
                    await expect(readBadge).toBeVisible();
                }

                await newContext.close();
            });
        });

        test('should clear read status when localStorage is cleared', async ({ page, homePage, publishedBlogPage }) => {
            await test.step('read a blog and mark it as read', async () => {
                await homePage.goto();
                await homePage.waitForBlogCardsToLoad();

                const firstBlogCard = await homePage.getBlogCardByIndex(0);
                await homePage.clickReadMoreOnCard(firstBlogCard);
                await publishedBlogPage.waitForPageLoad();

                await page.waitForTimeout(1000);
            });

            await test.step('verify blog is marked as read', async () => {
                await homePage.goto();
                await homePage.waitForBlogCardsToLoad();

                const firstCard = await homePage.getBlogCardByIndex(0);
                const hasReadBadge = await homePage.hasReadBadge(firstCard);
                expect(hasReadBadge).toBe(true);
            });

            await test.step('clear localStorage and verify read status is reset', async () => {
                await page.evaluate(() => {
                    localStorage.clear();
                });

                await homePage.goto();
                await homePage.waitForBlogCardsToLoad();

                const readBlogs = await homePage.getReadBlogsFromStorage();
                expect(readBlogs.length).toBe(0);

                const firstCard = await homePage.getBlogCardByIndex(0);
                const hasReadBadge = await homePage.hasReadBadge(firstCard);
                expect(hasReadBadge).toBe(false);
            });
        });
    });
});

