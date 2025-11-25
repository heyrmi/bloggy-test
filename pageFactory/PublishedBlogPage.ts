import { BrowserContext, Locator, Page, expect } from "@playwright/test";

export class PublishedBlogPage {
    readonly page: Page;
    readonly context: BrowserContext;

    // Header Locators
    readonly blogTitle: Locator;
    readonly liveStatusIcon: Locator;
    readonly liveStatusText: Locator;
    readonly viewsCount: Locator;
    readonly likesCount: Locator;
    readonly likeButton: Locator;
    readonly publishedDate: Locator;

    // Tag/Category Locators
    readonly primaryTag: Locator;
    readonly allTags: Locator;

    // Content Locators
    readonly contentContainer: Locator;
    readonly contentHeadings: Locator;
    readonly contentParagraphs: Locator;

    // Comment Section Locators
    readonly commentsHeading: Locator;
    readonly authorBadgeInfo: Locator;
    readonly commentInput: Locator;
    readonly characterCount: Locator;
    readonly postCommentButton: Locator;
    readonly commentsList: Locator;

    constructor(page: Page, context: BrowserContext) {
        this.page = page;
        this.context = context;

        // Header Locators
        this.blogTitle = page.locator('h1');
        this.liveStatusIcon = page.locator('[data-testid="CircleIcon"]');
        this.liveStatusText = page.locator('span.MuiTypography-caption', { hasText: 'Live' });
        this.viewsCount = page.locator('p.MuiTypography-body2', { hasText: 'views' });
        this.likesCount = page.locator('p.MuiTypography-body2', { hasText: 'likes' });
        this.likeButton = page.locator('button', { has: page.locator('[data-testid="ThumbUpIcon"]') });
        this.publishedDate = page.locator('span.MuiTypography-caption.MuiTypography-gutterBottom');

        // Tag/Category Locators
        this.primaryTag = page.locator('.MuiChip-filledPrimary .MuiChip-label');
        this.allTags = page.locator('.MuiChip-root .MuiChip-label');

        // Content Locators
        this.contentContainer = page.locator('div.MuiBox-root.css-1yjvs5a');
        this.contentHeadings = this.contentContainer.locator('h2, h3, h4, h5, h6');
        this.contentParagraphs = this.contentContainer.locator('p');

        // Comment Section Locators
        this.commentsHeading = page.locator('h5.MuiTypography-h5', { hasText: 'Comments' });
        this.authorBadgeInfo = page.locator('.MuiAlert-message', { hasText: 'Posting as Author' });
        this.commentInput = page.locator('textarea[aria-describedby*="helper-text"]');
        this.characterCount = page.locator('p.MuiFormHelperText-root', { hasText: 'characters' });
        this.postCommentButton = page.getByRole('button', { name: 'Post as Author' });
        this.commentsList = page.locator('ul.MuiList-root');
    }

    // Navigation Actions
    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('load');
        await expect(this.blogTitle).toBeVisible();
    }

    // Getter methods for dynamic content
    async getBlogTitle(): Promise<string> {
        return await this.blogTitle.textContent() || '';
    }

    async getAllTags(): Promise<string[]> {
        return await this.allTags.allTextContents();
    }

    // State checks
    async isLiveStatusVisible(): Promise<boolean> {
        return await this.liveStatusIcon.isVisible() &&
            await this.liveStatusText.isVisible();
    }
}