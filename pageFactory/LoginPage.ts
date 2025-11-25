import { BrowserContext, Locator, Page } from "@playwright/test";

export class LoginPage {
    readonly page: Page;
    readonly context: BrowserContext;

    // Locators
    readonly adminHeading: Locator;
    readonly errorMessage: Locator;
    readonly loginTab: Locator;
    readonly password: Locator;
    readonly registerTab: Locator;
    readonly username: Locator;
    readonly loginButton: Locator;
    readonly registerButton: Locator;


    constructor(page: Page, context: BrowserContext) {
        this.page = page;
        this.context = context;

        // Locators init
        this.adminHeading = page.locator('h1');
        this.errorMessage = page.getByRole('alert');
        this.loginTab = page.getByRole('tab', { name: 'Login' });
        this.registerTab = page.getByRole('tab', { name: 'Register' });
        this.username = page.getByLabel('Username');
        this.password = page.getByLabel('Password');
        this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
        this.registerButton = page.getByRole('button', { name: 'Register', exact: true });
    }


    // Actions
    async goto(): Promise<void> {
        await this.page.goto('/login');
    }

    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('load');
        await this.adminHeading.waitFor({ state: 'visible' });
    }

    async login(username: string, password: string): Promise<void> {
        await this.loginTab.click();
        await this.username.fill(username);
        await this.password.fill(password);
        await this.loginButton.click();
    }

    async register(username: string, password: string): Promise<void> {
        await this.registerTab.click();
        await this.username.fill(username);
        await this.password.fill(password);
        await this.registerButton.click();
    }
}