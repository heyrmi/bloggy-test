import { FileUtils } from '@/lib/utils/FileUtils';
import { faker } from '@faker-js/faker';
import test from '@lib/BaseTest';
import { expect } from '@playwright/test';

test.describe('Admin Page - Blog Management', () => {
    test.beforeEach(async ({ loginPage, adminPage }) => {
        await loginPage.goto();
        const loginData = FileUtils.readJsonFile<{ loginValid: { username: string; password: string } }>('testData/login.json');
        await loginPage.login(loginData.loginValid.username, loginData.loginValid.password);
        await adminPage.waitForPageLoad();
    });

    test.describe('Page Display Testing', () => {
        test('should display admin page with correct heading', async ({ adminPage }) => {
            await expect(adminPage.adminHeading).toBeVisible();
            await expect(adminPage.adminHeading).toHaveText('Blog Management');
        });

        test('should display new blog post button', async ({ adminPage }) => {
            await expect(adminPage.newBlogPostButton).toBeVisible();
            await expect(adminPage.newBlogPostButton).toContainText('New Blog Post');
        });

        test('should display all table headers', async ({ adminPage }) => {
            await expect(adminPage.titleHeader).toBeVisible();
            await expect(adminPage.categoryHeader).toBeVisible();
            await expect(adminPage.statusHeader).toBeVisible();
            await expect(adminPage.viewsHeader).toBeVisible();
            await expect(adminPage.likesHeader).toBeVisible();
            await expect(adminPage.commentsHeader).toBeVisible();
            await expect(adminPage.createdHeader).toBeVisible();
            await expect(adminPage.actionsHeader).toBeVisible();
        });

        test('should display blog posts in table', async ({ adminPage }) => {
            await expect(adminPage.tableRows.first()).toBeVisible();
            const postCount = await adminPage.getBlogPostCount();
            expect(postCount).toBeGreaterThan(0);
        });

        test('should display pagination controls', async ({ adminPage }) => {
            await expect(adminPage.previousPageButton).toBeVisible();
            await expect(adminPage.nextPageButton).toBeVisible();
            await expect(adminPage.pageOneButton).toBeVisible();
            await expect(adminPage.currentPageButton).toBeVisible();
        });
    });

    test.describe('Blog Post Data Verification', () => {
        test('should display correct blog post titles', async ({ adminPage }) => {
            const firstTitle = await adminPage.blogTitles.first().textContent();
            expect(firstTitle).toBeTruthy();
            expect(firstTitle?.length).toBeGreaterThan(0);
        });

        test('should display category chips for all posts', async ({ adminPage }) => {
            const categoryCount = await adminPage.categoryChips.count();
            const postCount = await adminPage.getBlogPostCount();
            expect(categoryCount).toBe(postCount);
        });

        test('should display published status for posts', async ({ adminPage }) => {
            const statusCount = await adminPage.statusChips.count();
            const postCount = await adminPage.getBlogPostCount();
            expect(statusCount).toBe(postCount);

            // Verify status text
            const firstStatus = await adminPage.statusChips.first().textContent();
            expect(firstStatus).toBe('published');
        });

        test('should display numerical metrics for posts', async ({ adminPage }) => {
            // Verify views
            const firstViews = await adminPage.viewCounts.first().textContent();
            expect(firstViews).toMatch(/^\d+$/);

            // Verify likes
            const firstLikes = await adminPage.likeCounts.first().textContent();
            expect(firstLikes).toMatch(/^\d+$/);

            // Verify comments
            const firstComments = await adminPage.commentCounts.first().textContent();
            expect(firstComments).toMatch(/^\d+$/);
        });

        test('should display created dates in correct format', async ({ adminPage }) => {
            const firstDate = await adminPage.createdDates.first().textContent();
            expect(firstDate).toMatch(/^[A-Za-z]{3}\s\d{1,2},\s\d{4}$/); // Format: Nov 24, 2025
        });
    });

    test.describe('Action Buttons Testing', () => {
        test('should display all action buttons for each post', async ({ adminPage }) => {
            const postCount = await adminPage.getBlogPostCount();

            const viewButtonCount = await adminPage.viewButtons.count();
            const editButtonCount = await adminPage.editButtons.count();
            const deleteButtonCount = await adminPage.deleteButtons.count();

            expect(viewButtonCount).toBe(postCount);
            expect(editButtonCount).toBe(postCount);
            expect(deleteButtonCount).toBe(postCount);
        });

        test('should verify action buttons have correct titles', async ({ adminPage }) => {
            await expect(adminPage.viewButtons.first()).toHaveAttribute('title', 'View');
            await expect(adminPage.editButtons.first()).toHaveAttribute('title', 'Edit');
            await expect(adminPage.deleteButtons.first()).toHaveAttribute('title', 'Delete');
        });

        test('should display action buttons for specific blog post', async ({ adminPage }) => {
            await expect(adminPage.tableRows.first()).toBeVisible();

            const blogTitle = 'Getting Started with TypeScript';
            const isVisible = await adminPage.verifyBlogPostExists(blogTitle);
            expect(isVisible).toBeTruthy();

            await expect(adminPage.getViewButtonForPost(blogTitle)).toBeVisible();
            await expect(adminPage.getEditButtonForPost(blogTitle)).toBeVisible();
            await expect(adminPage.getDeleteButtonForPost(blogTitle)).toBeVisible();
        });
    });

    test.describe('Blog Post Interaction Testing', () => {
        test('should click view button for a specific post', async ({ adminPage, publishedBlogPage }) => {
            await expect(adminPage.tableRows.first()).toBeVisible();

            const blogTitle = 'Getting Started with TypeScript';
            await test.step('verify blog post exists', async () => {
                const exists = await adminPage.verifyBlogPostExists(blogTitle);
                expect(exists).toBeTruthy();
            });

            await test.step('click view button', async () => {
                await adminPage.clickViewForPost(blogTitle);
                await expect(adminPage.page).toHaveURL(/.*blog\/.*/);
                await publishedBlogPage.waitForPageLoad();
                await expect(publishedBlogPage.blogTitle).toBeVisible();
                await expect(publishedBlogPage.blogTitle).toHaveText(blogTitle);
            });
        });

        test('should click edit button for a specific post', async ({ adminPage, createBlogPage }) => {
            await expect(adminPage.tableRows.first()).toBeVisible();

            const blogTitle = 'Modern React Patterns in 2024';
            await test.step('verify blog post exists', async () => {
                const exists = await adminPage.verifyBlogPostExists(blogTitle);
                expect(exists).toBeTruthy();
            });

            await test.step('click edit button', async () => {
                await adminPage.clickEditForPost(blogTitle);
                await expect(adminPage.page).toHaveURL(/.*blog\/.*/);

                await expect(createBlogPage.editBlogPostHeading).toBeVisible();
                await expect(createBlogPage.editBlogPostHeading).toHaveText('Edit Blog Post');
                await expect(createBlogPage.titleInput).toBeVisible();
                await expect(createBlogPage.titleInput).toHaveValue(blogTitle);
                await expect(createBlogPage.excerptInput).toBeVisible();
                await expect(createBlogPage.excerptInput).toHaveValue('Explore the latest patterns and best practices for building scalable React applications.');
                await expect(createBlogPage.quillEditorContent).toBeVisible();
                await createBlogPage.quillEditorContent.fill(faker.lorem.paragraphs(10));
                await expect(createBlogPage.statusToggleGroup).toBeVisible();
                await expect(createBlogPage.saveButton).toBeVisible();
                await expect(createBlogPage.saveButton).toHaveText('Save');
                await createBlogPage.clickSave();
            });
        });

        test('should click delete button for a specific post', async ({ adminPage }) => {
            await expect(adminPage.tableRows.first()).toBeVisible();

            const blogTitle = 'CSS Grid vs Flexbox: When to Use Which';
            await test.step('verify blog post exists', async () => {
                const exists = await adminPage.verifyBlogPostExists(blogTitle);
                expect(exists).toBeTruthy();
            });

            await test.step('click delete button', async () => {
                await adminPage.clickDeleteForPost(blogTitle);
                await adminPage.verifyDeleteModalHiddenAfterClickingConfirm()
                //check if the blog post is deleted
                const exists = await adminPage.verifyBlogPostExists(blogTitle);
                expect(exists).toBeFalsy();
            });
        });

        test('should click new blog post button', async ({ adminPage }) => {
            await adminPage.clickNewBlogPost();
            await expect(adminPage.page).toHaveURL(/.*new/);
        });
    });

    test.describe('Pagination Testing', () => {
        test('should have previous button disabled on first page', async ({ adminPage }) => {
            await expect(adminPage.previousPageButton).toBeDisabled();
        });

        test('should have page 1 selected by default', async ({ adminPage }) => {
            await expect(adminPage.currentPageButton).toHaveAttribute('aria-current', 'true');
            await expect(adminPage.currentPageButton).toContainText('1');
        });

        test('should navigate to next page', async ({ adminPage }) => {
            await test.step('verify next button is enabled', async () => {
                await expect(adminPage.nextPageButton).toBeEnabled();
            });

            await test.step('click next page button', async () => {
                await adminPage.goToNextPage();
            });

            await test.step('verify page 2 is selected', async () => {
                await expect(adminPage.currentPageButton).toContainText('2');
            });

            await test.step('verify previous button is now enabled', async () => {
                await expect(adminPage.previousPageButton).toBeEnabled();
            });
        });

        test('should navigate to specific page', async ({ adminPage }) => {
            await test.step('navigate to page 2', async () => {
                await adminPage.goToPage(2);
            });

            await test.step('verify page 2 is selected', async () => {
                await expect(adminPage.currentPageButton).toContainText('2');
                await expect(adminPage.currentPageButton).toHaveAttribute('aria-current', 'true');
            });
        });

        test('should navigate back to previous page', async ({ adminPage }) => {
            await test.step('navigate to page 2', async () => {
                await adminPage.goToPage(2);
                await expect(adminPage.currentPageButton).toContainText('2');
            });

            await test.step('navigate to previous page', async () => {
                await adminPage.goToPreviousPage();
            });

            await test.step('verify page 1 is selected', async () => {
                await expect(adminPage.currentPageButton).toContainText('1');
            });
        });
    });

    test.describe('Table Data Validation', () => {
        test('should verify specific blog post data', async ({ adminPage }) => {
            const blogTestData = FileUtils.readJsonFile<{
                blogPosts: Array<{
                    title: string;
                    category: string;
                    status: string;
                    views: number;
                    likes: number;
                    comments: number;
                }>
            }>('testData/blogPosts.json');

            const firstPost = blogTestData.blogPosts[0];
            const row = adminPage.getRowByTitle(firstPost.title);

            await expect(row).toBeVisible();
        });

        test('should display correct number of posts per page', async ({ adminPage }) => {
            await expect(adminPage.tableRows.first()).toBeVisible();
            const POSTS_PER_PAGE = 10;
            const postCount = await adminPage.getBlogPostCount();
            expect(postCount).toBeGreaterThanOrEqual(1);
            expect(postCount).toBeLessThanOrEqual(POSTS_PER_PAGE);
        });
    });

    test.describe('Responsive Design Testing', () => {
        test('should display correctly on mobile viewport', async ({ adminPage }) => {
            await adminPage.page.setViewportSize({ width: 375, height: 667 });
            await expect(adminPage.adminHeading).toBeVisible();
            await expect(adminPage.newBlogPostButton).toBeVisible();
        });

        test('should display correctly on tablet viewport', async ({ adminPage }) => {
            await adminPage.page.setViewportSize({ width: 768, height: 1024 });
            await expect(adminPage.adminHeading).toBeVisible();
            await expect(adminPage.tableRows.first()).toBeVisible();
        });

        test('should display correctly on desktop viewport', async ({ adminPage }) => {
            await adminPage.page.setViewportSize({ width: 1920, height: 1080 });
            await expect(adminPage.adminHeading).toBeVisible();
            await expect(adminPage.tableRows.first()).toBeVisible();
        });
    });

    test.describe('Performance Testing', () => {
        test('should load blog posts within acceptable time', async ({ adminPage }) => {
            const startTime = Date.now();
            await adminPage.waitForPageLoad();
            const loadTime = Date.now() - startTime;

            expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
        });
    });
});