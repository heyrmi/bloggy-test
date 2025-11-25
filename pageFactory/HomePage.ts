import { BrowserContext, Locator, Page, expect } from "@playwright/test";
import { testConfig } from "@/testConfig";

export class HomePage {
    readonly page: Page;
    readonly context: BrowserContext;

    // Locators
    readonly adminLoginButton: Locator;
    readonly logoBlogApp: Locator;
    readonly pageMainHeading: Locator;
    readonly categoryDropdown: Locator;
    readonly darkModeButton: Locator;
    readonly dashboardButton: Locator;
    readonly homeButton: Locator;
    readonly logoutButton: Locator;
    readonly searchBox: Locator;

    // Blog Card Locators
    readonly blogCards: Locator;
    readonly readBadge: Locator;

    constructor(page: Page, context: BrowserContext) {
        this.page = page;
        this.context = context;

        // Header Locators
        this.adminLoginButton = page.getByRole('link', { name: 'Admin Login' });
        this.logoBlogApp = page.getByRole('link', { name: 'Blog App' });
        this.homeButton = page.getByRole('link', { name: 'Home' });
        this.darkModeButton = page.getByRole('button', { name: /switch to/i });
        this.dashboardButton = page.getByRole('link', { name: 'Dashboard' });
        this.logoutButton = page.getByRole('button', { name: 'Logout' });

        // Home Page Locators
        this.pageMainHeading = page.locator('h1');
        this.categoryDropdown = page.getByRole('combobox', { name: 'Category' });
        this.searchBox = page.getByPlaceholder('Search blogs...');

        // Blog Card Locators
        this.blogCards = page.locator('.MuiCard-root');
        this.readBadge = page.locator('.MuiChip-colorSuccess:has-text("Read")');
    }

    // Navigation Actions
    async goto(): Promise<void> {
        await this.page.goto(testConfig.uiUrl);
        await this.waitForPageLoad();
    }

    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('load');
        await expect(this.pageMainHeading).toBeVisible();
    }

    // Click Actions
    async clickDarkModeToggle(): Promise<void> {
        await this.darkModeButton.click();
    }

    async clickLogout(): Promise<void> {
        await this.logoutButton.click();
    }

    async clickAdminLogin(): Promise<void> {
        await this.adminLoginButton.click();
    }

    // Search and Filter Actions
    async searchBlogs(searchTerm: string): Promise<void> {
        await this.searchBox.fill(searchTerm);
    }

    async selectCategory(category: string): Promise<void> {
        await this.categoryDropdown.selectOption(category);
    }

    // Blog Card Methods
    async getBlogCardByIndex(index: number): Promise<Locator> {
        return this.blogCards.nth(index);
    }

    async getBlogCardTitle(card: Locator): Promise<string> {
        const title = await card.locator('h2.MuiTypography-h5').textContent();
        return title || '';
    }

    async clickReadMoreOnCard(card: Locator): Promise<void> {
        await card.getByRole('button', { name: 'Read More' }).click();
    }

    async hasReadBadge(card: Locator): Promise<boolean> {
        const readBadge = card.locator('.MuiChip-colorSuccess:has-text("Read")');
        return await readBadge.count() > 0;
    }

    async getReadBlogsFromStorage(): Promise<string[]> {
        return await this.page.evaluate(() => {
            const stored = localStorage.getItem('readBlogs');
            if (!stored) return [];
            try {
                return JSON.parse(stored);
            } catch {
                return [];
            }
        });
    }

    async waitForBlogCardsToLoad(): Promise<void> {
        await this.blogCards.first().waitFor({ state: 'visible', timeout: 10000 });
    }
}
