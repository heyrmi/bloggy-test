import { BrowserContext, Locator, Page, expect } from "@playwright/test";
import { testConfig } from "@/testConfig";

// Combining the create and edit blog post page into one page object
export class CreateBlogPage {
    readonly page: Page;
    readonly context: BrowserContext;

    // Header Locators
    readonly createBlogPostHeading: Locator;
    readonly editBlogPostHeading: Locator;

    // Form Field Locators
    readonly titleInput: Locator;
    readonly excerptInput: Locator;
    readonly excerptHelperText: Locator;

    // Featured Image Locators
    readonly uploadImageButton: Locator;
    readonly uploadImageInput: Locator;
    readonly imageUploadHelpText: Locator;

    // Content Editor Locators
    readonly contentHeading: Locator;
    readonly quillEditor: Locator;
    readonly quillToolbar: Locator;
    readonly quillEditorContent: Locator;

    // Toolbar Button Locators
    readonly headerDropdown: Locator;
    readonly boldButton: Locator;
    readonly italicButton: Locator;
    readonly underlineButton: Locator;
    readonly strikeButton: Locator;
    readonly orderedListButton: Locator;
    readonly bulletListButton: Locator;
    readonly colorPicker: Locator;
    readonly backgroundPicker: Locator;
    readonly linkButton: Locator;
    readonly imageButton: Locator;
    readonly cleanButton: Locator;

    // Category and Tags Locators
    readonly categoryDropdown: Locator;
    readonly categoryInput: Locator;
    readonly tagsDropdown: Locator;
    readonly tagsInput: Locator;

    // Status Toggle Locators
    readonly statusToggleGroup: Locator;
    readonly draftButton: Locator;
    readonly publishedButton: Locator;

    // Action Button Locators
    readonly cancelButton: Locator;
    readonly saveButton: Locator;
    readonly publishButton: Locator;

    constructor(page: Page, context: BrowserContext) {
        this.page = page;
        this.context = context;

        // Header
        this.createBlogPostHeading = page.getByRole('heading', { name: 'Create New Blog Post', level: 1 });
        this.editBlogPostHeading = page.getByRole('heading', { name: 'Edit Blog Post', level: 1 });

        // Form Fields
        this.titleInput = page.getByLabel(/^title/i);
        this.excerptInput = page.getByLabel(/^excerpt/i);
        this.excerptHelperText = page.getByText('A short summary that appears in the blog list');

        // Featured Image Section
        this.uploadImageButton = page.getByRole('button', { name: 'Upload Image' });
        this.uploadImageInput = page.locator('input[type="file"][accept*="image"]');
        this.imageUploadHelpText = page.getByText('Max 5MB. Allowed: JPG, PNG, GIF, WebP');

        // Content Editor
        this.contentHeading = page.getByRole('heading', { name: 'Content', level: 6 });
        this.quillEditor = page.locator('.quill');
        this.quillToolbar = page.locator('.ql-toolbar');
        this.quillEditorContent = page.locator('.ql-editor');

        // Toolbar Buttons
        this.headerDropdown = page.locator('.ql-header').first();
        this.boldButton = page.locator('button.ql-bold');
        this.italicButton = page.locator('button.ql-italic');
        this.underlineButton = page.locator('button.ql-underline');
        this.strikeButton = page.locator('button.ql-strike');
        this.orderedListButton = page.locator('button.ql-list[value="ordered"]');
        this.bulletListButton = page.locator('button.ql-list[value="bullet"]');
        this.colorPicker = page.locator('.ql-color').first();
        this.backgroundPicker = page.locator('.ql-background').first();
        this.linkButton = page.locator('button.ql-link');
        this.imageButton = page.locator('button.ql-image');
        this.cleanButton = page.locator('button.ql-clean');

        // Category and Tags
        // this.categoryDropdown = page.getByRole('combobox', { name: /category/i });
        this.categoryDropdown = page.locator("//label[text()='Category']//following-sibling::div/div");
        this.categoryInput = page.locator('input[aria-labelledby*="category"]');
        this.tagsDropdown = page.locator("//label[text()='Tags']//following-sibling::div/div");
        this.tagsInput = page.locator('input[aria-labelledby*="tags"]');

        // Status Toggle
        this.statusToggleGroup = page.getByRole('group', { name: 'blog status' });
        this.draftButton = this.statusToggleGroup.locator('button[value="draft"]');
        this.publishedButton = this.statusToggleGroup.locator('button[value="published"]');

        // Action Buttons
        this.cancelButton = page.getByRole('button', { name: 'Cancel' });
        this.saveButton = page.getByRole('button', { name: 'Save' });
        this.publishButton = page.getByRole('button', { name: 'Publish Now' });
    }

    // Navigation Actions
    async goto(): Promise<void> {
        await this.page.goto(`${testConfig.uiUrl}/admin/blog/new`);
        await this.waitForPageLoad();
    }

    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('load');
    }

    // Form Fill Actions
    async fillTitle(title: string): Promise<void> {
        await this.titleInput.fill(title);
    }

    async fillExcerpt(excerpt: string): Promise<void> {
        await this.excerptInput.fill(excerpt);
    }

    async fillContent(content: string): Promise<void> {
        await this.quillEditorContent.click();
        await this.quillEditorContent.fill(content);
    }

    async typeContent(content: string): Promise<void> {
        await this.quillEditorContent.click();
        await this.page.keyboard.type(content);
    }

    // Image Upload Actions
    async uploadImage(filePath: string): Promise<void> {
        await this.uploadImageInput.setInputFiles(filePath);
    }

    // Content Formatting Actions
    async clickBold(): Promise<void> {
        await this.boldButton.click();
    }

    async clickItalic(): Promise<void> {
        await this.italicButton.click();
    }

    async clickUnderline(): Promise<void> {
        await this.underlineButton.click();
    }

    async clickStrike(): Promise<void> {
        await this.strikeButton.click();
    }

    async clickOrderedList(): Promise<void> {
        await this.orderedListButton.click();
    }

    async clickBulletList(): Promise<void> {
        await this.bulletListButton.click();
    }

    async selectHeaderLevel(level: '1' | '2' | '3' | 'normal'): Promise<void> {
        await this.headerDropdown.click();
        const option = this.page.locator(`.ql-picker-item[data-value="${level === 'normal' ? '' : level}"]`);
        await option.click();
    }

    // Category and Tags Actions
    async selectCategory(category: string): Promise<void> {
        await this.categoryDropdown.click();
        await this.page.getByRole('option', { name: category }).click();
    }

    async selectTags(tags: string[]): Promise<void> {
        await this.tagsDropdown.click();
        for (const tag of tags) {
            await this.page.getByRole('option', { name: tag }).click();
        }
    }

    // Status Actions
    async selectDraftStatus(): Promise<void> {
        await this.draftButton.click();
    }

    async selectPublishedStatus(): Promise<void> {
        await this.publishedButton.click();
    }

    // Button Actions
    async clickCancel(): Promise<void> {
        await this.cancelButton.click();
    }

    async clickSave(): Promise<void> {
        await this.saveButton.click();
    }

    async clickPublish(): Promise<void> {
        await this.publishButton.click();
    }

    // Complete Form Fill Actions
    async fillBasicBlogDetails(data: {
        title: string;
        excerpt: string;
        content: string;
        category: string;
        tags?: string[];
    }): Promise<void> {
        await this.fillTitle(data.title);
        await this.fillExcerpt(data.excerpt);
        await this.fillContent(data.content);
        await this.selectCategory(data.category);
        if (data.tags && data.tags.length > 0) {
            await this.selectTags(data.tags);
        }
    }

    async getTitleValue(): Promise<string> {
        return await this.titleInput.inputValue();
    }

    async getExcerptValue(): Promise<string> {
        return await this.excerptInput.inputValue();
    }

    async getContentValue(): Promise<string> {
        return await this.quillEditorContent.textContent() || '';
    }
}