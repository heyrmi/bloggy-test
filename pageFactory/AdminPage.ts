import { BrowserContext, expect, Locator, Page } from '@playwright/test';

export class AdminPage {
    readonly page: Page;
    readonly context: BrowserContext;

    // Header Locators
    readonly adminHeading: Locator;
    readonly newBlogPostButton: Locator;

    // Table Header Locators
    readonly titleHeader: Locator;
    readonly categoryHeader: Locator;
    readonly statusHeader: Locator;
    readonly viewsHeader: Locator;
    readonly likesHeader: Locator;
    readonly commentsHeader: Locator;
    readonly createdHeader: Locator;
    readonly actionsHeader: Locator;

    // Table Body Locators (Generic - can be used with filters)
    readonly tableRows: Locator;
    readonly blogTitles: Locator;
    readonly categoryChips: Locator;
    readonly statusChips: Locator;
    readonly viewCounts: Locator;
    readonly likeCounts: Locator;
    readonly commentCounts: Locator;
    readonly createdDates: Locator;

    // Action Button Locators (Generic)
    readonly viewButtons: Locator;
    readonly editButtons: Locator;
    readonly deleteButtons: Locator;

    // Pagination Locators
    readonly previousPageButton: Locator;
    readonly nextPageButton: Locator;
    readonly pageOneButton: Locator;
    readonly currentPageButton: Locator;

    // Delete Modal Locators
    readonly deleteModal: Locator;
    readonly deleteModalTitle: Locator;
    readonly deleteModalMessage: Locator;
    readonly deleteModalCancelButton: Locator;
    readonly deleteModalConfirmButton: Locator;

    constructor(page: Page, context: BrowserContext) {
        this.page = page;
        this.context = context;

        // Header Locators
        this.adminHeading = page.locator('h1');
        this.newBlogPostButton = page.getByRole('button', { name: 'New Blog Post' });

        // Table Header Locators
        this.titleHeader = page.locator('//th[text()="Title"]');
        this.categoryHeader = page.locator('//th[text()="Category"]');
        this.statusHeader = page.locator('//th[text()="Status"]');
        this.viewsHeader = page.locator('//th[text()="Views"]');
        this.likesHeader = page.locator('//th[text()="Likes"]');
        this.commentsHeader = page.locator('//th[text()="Comments"]');
        this.createdHeader = page.locator('//th[text()="Created"]');
        this.actionsHeader = page.locator('//th[text()="Actions"]');

        // Table Body Locators
        this.tableRows = page.locator('//tbody[contains(@class, "MuiTableBody-root")]//tr');
        this.blogTitles = page.locator('//tbody[contains(@class, "MuiTableBody-root")]//tr/td[1]');
        this.categoryChips = page.locator('//tbody[contains(@class, "MuiTableBody-root")]//td[2]//span[contains(@class, "MuiChip-label")]');
        this.statusChips = page.locator('//tbody[contains(@class, "MuiTableBody-root")]//td[3]//span[contains(@class, "MuiChip-label")]');
        this.viewCounts = page.locator('//tbody[contains(@class, "MuiTableBody-root")]//td[4]');
        this.likeCounts = page.locator('//tbody[contains(@class, "MuiTableBody-root")]//td[5]');
        this.commentCounts = page.locator('//tbody[contains(@class, "MuiTableBody-root")]//td[6]');
        this.createdDates = page.locator('//tbody[contains(@class, "MuiTableBody-root")]//td[7]');

        // Action Button Locators
        this.viewButtons = page.locator('//button[@title="View"]');
        this.editButtons = page.locator('//button[@title="Edit"]');
        this.deleteButtons = page.locator('//button[@title="Delete"]');

        // Pagination Locators
        this.previousPageButton = page.locator('//button[@aria-label="Go to previous page"]');
        this.nextPageButton = page.locator('//button[@aria-label="Go to next page"]');
        this.pageOneButton = page.locator('//button[@aria-label="page 1"]');
        this.currentPageButton = page.locator('//button[@aria-current="true"]');

        // Delete Modal Locators
        this.deleteModal = page.locator('//div[@role="dialog"]');
        this.deleteModalTitle = page.locator('//h2[text()="Delete Blog Post"]');
        this.deleteModalMessage = page.locator('//div[contains(@class, "MuiDialogContent-root")][contains(text(), "Are you sure you want to delete")]');
        this.deleteModalCancelButton = page.getByRole('button', { name: 'Cancel' });
        this.deleteModalConfirmButton = page.getByTestId('confirm-delete-button');
    }

    // Actions
    async goto(): Promise<void> {
        await this.page.goto('/admin');
        await this.waitForPageLoad();
    }

    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('load');
        await expect(this.adminHeading).toBeVisible();
    }

    // Helper method to get a specific row by blog title
    getRowByTitle(title: string): Locator {
        return this.page.locator(`//tbody[contains(@class, "MuiTableBody-root")]//tr[.//td[text()="${title}"]]`);
    }

    // Helper method to get action buttons for a specific blog post
    getViewButtonForPost(title: string): Locator {
        return this.page.locator(`//tbody[contains(@class, "MuiTableBody-root")]//tr[.//td[text()="${title}"]]//button[@title="View"]`);
    }

    getEditButtonForPost(title: string): Locator {
        return this.page.locator(`//tbody[contains(@class, "MuiTableBody-root")]//tr[.//td[text()="${title}"]]//button[@title="Edit"]`);
    }

    getDeleteButtonForPost(title: string): Locator {
        return this.page.locator(`//tbody[contains(@class, "MuiTableBody-root")]//tr[.//td[text()="${title}"]]//button[@title="Delete"]`);
    }

    // Action methods
    async clickNewBlogPost(): Promise<void> {
        await this.newBlogPostButton.click();
    }

    async clickViewForPost(title: string): Promise<void> {
        await this.getViewButtonForPost(title).click();
    }

    async clickEditForPost(title: string): Promise<void> {
        await this.getEditButtonForPost(title).click();
    }

    async clickDeleteForPost(title: string): Promise<void> {
        await this.getDeleteButtonForPost(title).click();
    }

    async goToNextPage(): Promise<void> {
        await this.nextPageButton.click();
    }

    async goToPreviousPage(): Promise<void> {
        await this.previousPageButton.click();
    }

    async goToPage(pageNumber: number): Promise<void> {
        await this.page.locator(`//button[@aria-label="Go to page ${pageNumber}"]`).click();
    }

    // Verification methods
    async verifyBlogPostExists(title: string): Promise<boolean> {

        return await this.getRowByTitle(title).isVisible();
    }

    async getBlogPostCount(): Promise<number> {
        await this.waitForPageLoad();
        return await this.tableRows.count();
    }

    async verifyDeleteModalHiddenAfterClickingConfirm(): Promise<void> {
        await this.deleteModalConfirmButton.click();
        await expect(this.deleteModal).toBeHidden();
    }
}