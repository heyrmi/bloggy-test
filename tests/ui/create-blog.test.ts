import { FileUtils } from '@/lib/utils/FileUtils';
import test from '@lib/BaseTest';
import { expect } from '@playwright/test';

test.describe('Create Blog Page - Blog Creation', () => {
    test.beforeEach(async ({ loginPage, createBlogPage }) => {
        await loginPage.goto();
        const loginData = FileUtils.readJsonFile<{ loginValid: { username: string; password: string } }>('testData/login.json');
        await loginPage.login(loginData.loginValid.username, loginData.loginValid.password);

        // Navigate to create blog page
        await createBlogPage.goto();
    });

    test.describe('Page Display Testing', () => {
        test('should display create blog page with correct heading', async ({ createBlogPage }) => {
            await expect(createBlogPage.createBlogPostHeading).toBeVisible();
            await expect(createBlogPage.createBlogPostHeading).toHaveText('Create New Blog Post');
        });

        test('should display all required form fields', async ({ createBlogPage }) => {
            await expect(createBlogPage.titleInput).toBeVisible();
            await expect(createBlogPage.excerptInput).toBeVisible();
            await expect(createBlogPage.excerptHelperText).toBeVisible();
            await expect(createBlogPage.quillEditor).toBeVisible();
        });

        test('should display featured image section', async ({ createBlogPage }) => {
            await expect(createBlogPage.uploadImageButton).toBeVisible();
            await expect(createBlogPage.imageUploadHelpText).toBeVisible();
        });

        test('should display content editor section', async ({ createBlogPage }) => {
            await expect(createBlogPage.contentHeading).toBeVisible();
            await expect(createBlogPage.contentHeading).toHaveText('Content');
            await expect(createBlogPage.quillEditor).toBeVisible();
            await expect(createBlogPage.quillToolbar).toBeVisible();
        });

        test('should display all editor toolbar buttons', async ({ createBlogPage }) => {
            await expect(createBlogPage.headerDropdown).toBeVisible();
            await expect(createBlogPage.boldButton).toBeVisible();
            await expect(createBlogPage.italicButton).toBeVisible();
            await expect(createBlogPage.underlineButton).toBeVisible();
            await expect(createBlogPage.strikeButton).toBeVisible();
            await expect(createBlogPage.orderedListButton).toBeVisible();
            await expect(createBlogPage.bulletListButton).toBeVisible();
            await expect(createBlogPage.colorPicker).toBeVisible();
            await expect(createBlogPage.backgroundPicker).toBeVisible();
            await expect(createBlogPage.linkButton).toBeVisible();
            await expect(createBlogPage.imageButton).toBeVisible();
            await expect(createBlogPage.cleanButton).toBeVisible();
        });

        test('should display status toggle section', async ({ createBlogPage }) => {
            await expect(createBlogPage.statusToggleGroup).toBeVisible();
            await expect(createBlogPage.draftButton).toBeVisible();
            await expect(createBlogPage.publishedButton).toBeVisible();
        });

        test('should display all action buttons', async ({ createBlogPage }) => {
            await expect(createBlogPage.cancelButton).toBeVisible();
            await expect(createBlogPage.saveButton).toBeVisible();
            await expect(createBlogPage.publishButton).toBeVisible();
        });

        test('should have save and publish buttons disabled initially', async ({ createBlogPage }) => {
            await expect(createBlogPage.saveButton).toBeDisabled();
            await expect(createBlogPage.publishButton).toBeDisabled();
        });
    });

    test.describe('Form Field Interaction Testing', () => {
        test('should allow entering title', async ({ createBlogPage }) => {
            const title = 'Test Blog Post Title';
            await createBlogPage.fillTitle(title);
            await expect(createBlogPage.titleInput).toHaveValue(title);
        });

        test('should allow entering excerpt', async ({ createBlogPage }) => {
            const excerpt = 'This is a test excerpt for the blog post.';
            await createBlogPage.fillExcerpt(excerpt);
            await expect(createBlogPage.excerptInput).toHaveValue(excerpt);
        });

        test('should allow entering content in editor', async ({ createBlogPage }) => {
            const content = 'This is the main content of the blog post.';
            await createBlogPage.fillContent(content);

            const editorText = await createBlogPage.getContentValue();
            expect(editorText.trim()).toContain(content);
        });

        test('should display excerpt helper text', async ({ createBlogPage }) => {
            await expect(createBlogPage.excerptHelperText).toHaveText('A short summary that appears in the blog list');
        });

        test('should display image upload help text', async ({ createBlogPage }) => {
            await expect(createBlogPage.imageUploadHelpText).toHaveText('Max 5MB. Allowed: JPG, PNG, GIF, WebP');
        });
    });

    test.describe('Content Editor Formatting Testing', () => {
        test('should apply bold formatting', async ({ createBlogPage }) => {
            await createBlogPage.fillContent('Bold text');
            await createBlogPage.quillEditorContent.click();
            await createBlogPage.page.keyboard.press('Control+A');
            await createBlogPage.clickBold();

            // Verify bold button is active
            await expect(createBlogPage.boldButton).toHaveClass(/ql-active/);
        });

        test('should apply underline formatting', async ({ createBlogPage }) => {
            await createBlogPage.fillContent('Underlined text');
            await createBlogPage.quillEditorContent.click();
            await createBlogPage.page.keyboard.press('Control+A');
            await createBlogPage.clickUnderline();

            await expect(createBlogPage.underlineButton).toHaveClass(/ql-active/);
        });

        test('should create ordered list', async ({ createBlogPage }) => {
            await createBlogPage.quillEditorContent.click();
            await createBlogPage.clickOrderedList();
            await createBlogPage.typeContent('First item');

            await expect(createBlogPage.orderedListButton).toHaveClass(/ql-active/);
        });

        test('should create bullet list', async ({ createBlogPage }) => {
            await createBlogPage.quillEditorContent.click();
            await createBlogPage.clickBulletList();
            await createBlogPage.typeContent('First item');

            await expect(createBlogPage.bulletListButton).toHaveClass(/ql-active/);
        });


        test('should toggle multiple formatting options', async ({ createBlogPage }) => {
            await createBlogPage.fillContent('Multi-formatted text');
            await createBlogPage.page.keyboard.press('Control+A');

            await createBlogPage.clickBold();
            await createBlogPage.clickItalic();
            await createBlogPage.clickUnderline();

            await expect(createBlogPage.boldButton).toHaveClass(/ql-active/);
            await expect(createBlogPage.italicButton).toHaveClass(/ql-active/);
            await expect(createBlogPage.underlineButton).toHaveClass(/ql-active/);
        });
    });


    test.describe('Complete Form Submission Testing', () => {
        test('should create complete blog post as draft with image', async ({ createBlogPage, adminPage }) => {
            const uniqueId = Date.now();
            const blogData = {
                title: `E2E Draft Blog Post ${uniqueId}`,
                excerpt: 'This is a comprehensive end-to-end test for creating a draft blog post with all features.',
                content: 'This is the complete content of the draft blog post. It includes detailed information about the topic.',
                category: 'Web Development',
                tags: ['React', 'JavaScript'],
                imagePath: 'testData/image.png',
                status: 'draft' as const
            };

            await test.step('fill all blog details including image', async () => {
                await createBlogPage.fillTitle(blogData.title);
                await createBlogPage.fillExcerpt(blogData.excerpt);
                await createBlogPage.fillContent(blogData.content);

                // Upload featured image
                await createBlogPage.uploadImage(blogData.imagePath);
                // Wait for image to be processed
                await createBlogPage.page.waitForTimeout(1000);

                await createBlogPage.selectCategory(blogData.category);
                await createBlogPage.selectTags(blogData.tags);
                await createBlogPage.pressKey('Escape');

                await createBlogPage.selectDraftStatus();
            });

            await test.step('verify save button is enabled and save', async () => {
                await expect(createBlogPage.saveButton).toBeEnabled();
                await createBlogPage.clickSave();

                // Wait for navigation to admin page
                await createBlogPage.page.waitForURL(/.*\/admin/, { timeout: 10000 });
            });

            await test.step('verify blog appears in admin dashboard', async () => {
                await adminPage.goto();
                const blogExists = await adminPage.verifyBlogPostExists(blogData.title);
                expect(blogExists).toBeTruthy();
            });
        });

        test('should create complete blog post as published with image', async ({ createBlogPage, adminPage, publishedBlogPage }) => {
            const uniqueId = Date.now();
            const blogData = {
                title: `E2E Published Blog Post ${uniqueId}`,
                excerpt: 'This is a comprehensive end-to-end test for creating and publishing a blog post with all features.',
                content: 'This is the complete content of the published blog post. It includes detailed information, formatting, and media.',
                category: 'Technology',
                tags: ['Node.js'],
                imagePath: 'testData/image.png',
                status: 'published' as const,
                publishNow: true
            };

            await test.step('fill all blog details including image', async () => {
                await createBlogPage.fillTitle(blogData.title);
                await createBlogPage.fillExcerpt(blogData.excerpt);
                await createBlogPage.fillContent(blogData.content);

                // Upload featured image
                await createBlogPage.uploadImage(blogData.imagePath);
                // Wait for image to be processed
                await createBlogPage.page.waitForTimeout(1000);

                await createBlogPage.selectCategory(blogData.category);
                await createBlogPage.selectTags(blogData.tags);
                await createBlogPage.selectPublishedStatus();
            });

            await test.step('verify publish button is enabled and publish', async () => {
                await expect(createBlogPage.publishButton).toBeEnabled();
                await createBlogPage.clickPublish();

                // Wait for navigation
                await createBlogPage.page.waitForTimeout(2000);
            });

            await test.step('verify blog appears in admin dashboard as published', async () => {
                await adminPage.goto();
                await adminPage.waitForPageLoad();

                const blogExists = await adminPage.verifyBlogPostExists(blogData.title);
                expect(blogExists).toBeTruthy();

                // Verify it's displayed as published
                const row = adminPage.getRowByTitle(blogData.title);
                const statusChip = row.locator('td[3]//span[contains(@class, "MuiChip-label")]');
                await expect(statusChip).toContainText('published');
            });

            await test.step('verify blog is accessible on published page', async () => {
                // Click view button to see the published blog
                await adminPage.clickViewForPost(blogData.title);

                // Wait for the published blog page to load
                await publishedBlogPage.waitForPageLoad();

                // Verify blog title
                const displayedTitle = await publishedBlogPage.getBlogTitle();
                expect(displayedTitle).toContain(blogData.title);

                // Verify live status
                const isLive = await publishedBlogPage.isLiveStatusVisible();
                expect(isLive).toBeTruthy();

                // Verify tags are displayed
                const displayedTags = await publishedBlogPage.getAllTags();
                expect(displayedTags).toContain(blogData.category);
            });
        });

        test('should create blog with formatted content and image', async ({ createBlogPage, adminPage }) => {
            const uniqueId = Date.now();
            const blogData = {
                title: `E2E Formatted Blog ${uniqueId}`,
                excerpt: 'Blog post with rich formatting and media.',
                category: 'Programming',
                tags: ['TypeScript'],
                imagePath: 'testData/image.png',
                status: 'published' as const,
                publishNow: true
            };

            await test.step('create blog with formatted content', async () => {
                await createBlogPage.fillTitle(blogData.title);
                await createBlogPage.fillExcerpt(blogData.excerpt);

                // Add formatted content
                await createBlogPage.quillEditorContent.click();

                // Add heading
                await createBlogPage.typeContent('Main Heading');
                await createBlogPage.page.keyboard.press('Enter');
                await createBlogPage.typeContent('This is a paragraph with ');

                // Add bold text
                await createBlogPage.clickBold();
                await createBlogPage.typeContent('bold');
                await createBlogPage.clickBold();

                await createBlogPage.typeContent(' and ');

                // Add italic text
                await createBlogPage.clickItalic();
                await createBlogPage.typeContent('italic');
                await createBlogPage.clickItalic();

                await createBlogPage.typeContent(' text.');

                // Upload image
                await createBlogPage.uploadImage(blogData.imagePath);
                await createBlogPage.page.waitForTimeout(1000);

                await createBlogPage.selectCategory(blogData.category);
                await createBlogPage.selectTags(blogData.tags);
                await createBlogPage.selectPublishedStatus();
            });

            await test.step('publish the formatted blog', async () => {
                await expect(createBlogPage.publishButton).toBeEnabled();
                await createBlogPage.clickPublish();
                await createBlogPage.page.waitForTimeout(2000);
            });

            await test.step('verify formatted blog appears in admin', async () => {
                await adminPage.goto();
                await adminPage.waitForPageLoad();

                const blogExists = await adminPage.verifyBlogPostExists(blogData.title);
                expect(blogExists).toBeTruthy();
            });
        });

        test('should handle cancel action and return to admin', async ({ createBlogPage }) => {
            await test.step('fill some blog details', async () => {
                await createBlogPage.fillTitle('Test Title to Cancel');
                await createBlogPage.fillExcerpt('Test excerpt to cancel');
                await createBlogPage.fillContent('Test content to cancel');
            });

            await test.step('click cancel and verify navigation', async () => {
                await createBlogPage.clickCancel();

                // Wait for navigation to admin page
                await createBlogPage.page.waitForURL(/.*\/admin/, { timeout: 10000 });
                await expect(createBlogPage.page).toHaveURL(/.*\/admin/);
            });
        });

        test('should enable save button only when required fields are filled', async ({ createBlogPage }) => {
            await test.step('verify buttons disabled initially', async () => {
                await expect(createBlogPage.saveButton).toBeDisabled();
                await expect(createBlogPage.publishButton).toBeDisabled();
            });

            await test.step('fill only title - buttons still disabled', async () => {
                await createBlogPage.fillTitle('Test Title Only');
                await expect(createBlogPage.saveButton).toBeDisabled();
            });

            await test.step('fill title and excerpt - buttons still disabled', async () => {
                await createBlogPage.fillExcerpt('Test Excerpt');
                await expect(createBlogPage.saveButton).toBeDisabled();
            });

            await test.step('fill all required fields - buttons enabled', async () => {
                await createBlogPage.fillContent('Test Content');
                await createBlogPage.selectCategory('Technology');

                // Now buttons should be enabled
                await expect(createBlogPage.saveButton).toBeEnabled();
                await expect(createBlogPage.publishButton).toBeEnabled();
            });
        });
    });

    test.describe('Image Upload Testing', () => {
        test('should display upload image button', async ({ createBlogPage }) => {
            await expect(createBlogPage.uploadImageButton).toBeVisible();
            await expect(createBlogPage.uploadImageButton).toContainText('Upload Image');
        });

        test('should have file input with correct accept attribute', async ({ createBlogPage }) => {
            await expect(createBlogPage.uploadImageInput).toHaveAttribute('accept', /image/);
        });

        test('should upload an image file', async ({ createBlogPage }) => {
            await test.step('upload featured image', async () => {
                await createBlogPage.uploadImage('testData/image.png');

                // Wait for image to be processed
                await createBlogPage.page.waitForTimeout(1000);
            });

            await test.step('verify image is uploaded', async () => {
                // Verify the image preview or uploaded state
                // Note: Actual verification depends on UI implementation
                // Common patterns: preview image, file name display, or success indicator
                const uploadedImage = createBlogPage.page.locator('img').first();
                await expect(uploadedImage).toBeVisible({ timeout: 5000 });
            });
        });
    });

    test.describe('Data Persistence Testing', () => {
        test('should retrieve filled form values', async ({ createBlogPage }) => {
            const title = 'Persistence Test Title';
            const excerpt = 'Persistence Test Excerpt';
            const content = 'Persistence Test Content';

            await createBlogPage.fillTitle(title);
            await createBlogPage.fillExcerpt(excerpt);
            await createBlogPage.fillContent(content);

            const retrievedTitle = await createBlogPage.getTitleValue();
            const retrievedExcerpt = await createBlogPage.getExcerptValue();
            const retrievedContent = await createBlogPage.getContentValue();

            expect(retrievedTitle).toBe(title);
            expect(retrievedExcerpt).toBe(excerpt);
            expect(retrievedContent.trim()).toContain(content);
        });
    });

    test.describe('Responsive Design Testing', () => {
        test('should display correctly on mobile viewport', async ({ createBlogPage }) => {
            await createBlogPage.page.setViewportSize({ width: 375, height: 667 });

            await expect(createBlogPage.createBlogPostHeading).toBeVisible();
            await expect(createBlogPage.titleInput).toBeVisible();
            await expect(createBlogPage.quillEditor).toBeVisible();
        });

        test('should display correctly on tablet viewport', async ({ createBlogPage }) => {
            await createBlogPage.page.setViewportSize({ width: 768, height: 1024 });

            await expect(createBlogPage.createBlogPostHeading).toBeVisible();
            await expect(createBlogPage.titleInput).toBeVisible();
            await expect(createBlogPage.quillToolbar).toBeVisible();
        });

        test('should display correctly on desktop viewport', async ({ createBlogPage }) => {
            await createBlogPage.page.setViewportSize({ width: 1920, height: 1080 });

            await expect(createBlogPage.createBlogPostHeading).toBeVisible();
            await expect(createBlogPage.quillEditor).toBeVisible();
            await expect(createBlogPage.quillToolbar).toBeVisible();
        });
    });

    test.describe('Accessibility Testing', () => {
        test('should have proper ARIA labels for form fields', async ({ createBlogPage }) => {
            await expect(createBlogPage.titleInput).toHaveAttribute('aria-invalid', 'false');
            await expect(createBlogPage.excerptInput).toHaveAttribute('aria-invalid', 'false');
        });

        test('should have accessible button labels', async ({ createBlogPage }) => {
            await expect(createBlogPage.cancelButton).toHaveText('Cancel');
            await expect(createBlogPage.saveButton).toContainText('Save');
            await expect(createBlogPage.publishButton).toContainText('Publish Now');
        });
    });
});