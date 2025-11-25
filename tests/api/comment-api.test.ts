import { testConfig } from '@/testConfig';
import { testData } from '@/testData/testData';
import test from '@lib/BaseTest';
import { expect } from '@playwright/test';
import * as allure from 'allure-js-commons';

test.describe.serial('Comment API Tests', () => {
    const apiUrl = testConfig.apiUrl;
    const loginData = testData.loginData;
    let authToken: string;
    let testBlogId: number;
    let createdCommentId: number;

    // Setup: Login and get a published blog
    test.beforeAll(async ({ request }) => {
        // Login to get auth token
        const loginResponse = await request.post(`${apiUrl}/api/auth/login`, {
            data: loginData.loginValid
        });
        const loginBody = await loginResponse.json();
        authToken = loginBody.token;

        const blogsResponse = await request.get(`${apiUrl}/api/blogs/public?limit=1`);
        const blogsBody = await blogsResponse.json();

        if (blogsBody.data && blogsBody.data.length > 0) {
            testBlogId = blogsBody.data[0].id;
        }
    });

    test.describe('GET /api/comments/blog/:blogId - Get Comments', () => {
        test('should get all comments for a blog', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Comment Management');
            allure.story('Get Comments');
            allure.description('Verify that all comments for a blog can be retrieved');

            if (!testBlogId) {
                test.skip();
                return;
            }

            const response = await apiActions.get(`${apiUrl}/api/comments/blog/${testBlogId}`);

            await apiActions.verifyStatusCode(response, 200);
            const body = await apiActions.getResponseJson<any>(response);

            expect(body).toBeInstanceOf(Array);

            // Verify comment structure if comments exist
            if (body.length > 0) {
                body.forEach((comment: any) => {
                    expect(comment).toHaveProperty('id');
                    expect(comment).toHaveProperty('blogId', testBlogId);
                    expect(comment).toHaveProperty('content');
                    expect(comment).toHaveProperty('authorName');
                    expect(comment).toHaveProperty('isAuthor');
                    expect(comment).toHaveProperty('createdAt');
                });
            }
        });

        test('should return 404 for comments on non-existent blog', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Comment Management');
            allure.story('Get Comments');
            allure.description('Verify that 404 is returned for non-existent blog');

            const response = await apiActions.get(`${apiUrl}/api/comments/blog/999999`);

            await apiActions.verifyStatusCode(response, 404);
            const body = await apiActions.getResponseJson<any>(response);
            expect(body.error).toBe('Blog not found');
        });

        test('should return empty array for blog with no comments', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Comment Management');
            allure.story('Get Comments');
            allure.description('Verify that empty array is returned for blog with no comments');

            if (!testBlogId) {
                test.skip();
                return;
            }

            const response = await apiActions.get(`${apiUrl}/api/comments/blog/${testBlogId}`);

            await apiActions.verifyStatusCode(response, 200);
            const body = await apiActions.getResponseJson<any>(response);

            expect(body).toBeInstanceOf(Array);
        });
    });

    test.describe('POST /api/comments - Create Comment', () => {
        test('should create a new comment as public user', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Comment Management');
            allure.story('Create Comment');
            allure.description('Verify that public users can create comments');

            if (!testBlogId) {
                test.skip();
                return;
            }

            const timestamp = Date.now();
            const newComment = {
                blogId: testBlogId,
                content: `This is a test comment created at ${timestamp}`,
                authorName: `Test User ${timestamp}`
            };

            const response = await apiActions.post(`${apiUrl}/api/comments`, newComment);

            await apiActions.verifyStatusCode(response, 201);
            const body = await apiActions.getResponseJson<any>(response);

            expect(body).toHaveProperty('id');
            expect(body.blogId).toBe(newComment.blogId);
            expect(body.content).toBe(newComment.content);
            expect(body.authorName).toBe(newComment.authorName);
            expect(body.isAuthor).toBe(false);
            expect(body).toHaveProperty('createdAt');

            createdCommentId = body.id;
        });

        test('should fail to create comment with missing required fields', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Comment Management');
            allure.story('Create Comment');
            allure.description('Verify that comment creation fails with missing required fields');

            const invalidComment = {
                blogId: testBlogId
                // Missing content and authorName
            };

            const response = await apiActions.post(`${apiUrl}/api/comments`, invalidComment);

            await apiActions.verifyStatusCode(response, 400);
            const body = await apiActions.getResponseJson<any>(response);
            expect(body.error).toBe('Missing required fields');
        });

        test('should fail to create comment with empty content', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Comment Management');
            allure.story('Create Comment');
            allure.description('Verify that comment creation fails with empty content');

            const invalidComment = {
                blogId: testBlogId,
                content: '   ',
                authorName: 'Test User'
            };

            const response = await apiActions.post(`${apiUrl}/api/comments`, invalidComment);

            await apiActions.verifyStatusCode(response, 400);
            const body = await apiActions.getResponseJson<any>(response);
            expect(body.error).toBe('Comment cannot be empty');
        });

        test('should fail to create comment with content exceeding max length', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Comment Management');
            allure.story('Create Comment');
            allure.description('Verify that comment creation fails when content exceeds maximum length');

            const longContent = 'a'.repeat(2001); // Max is 2000 characters
            const invalidComment = {
                blogId: testBlogId,
                content: longContent,
                authorName: 'Test User'
            };

            const response = await apiActions.post(`${apiUrl}/api/comments`, invalidComment);

            await apiActions.verifyStatusCode(response, 400);
            const body = await apiActions.getResponseJson<any>(response);
            expect(body.error).toContain('cannot exceed');
        });

        test('should fail to create comment with empty author name', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Comment Management');
            allure.story('Create Comment');
            allure.description('Verify that comment creation fails with empty author name');

            const invalidComment = {
                blogId: testBlogId,
                content: 'Valid content',
                authorName: '   '
            };

            const response = await apiActions.post(`${apiUrl}/api/comments`, invalidComment);

            await apiActions.verifyStatusCode(response, 400);
            const body = await apiActions.getResponseJson<any>(response);
            expect(body.error).toContain('Author name');
        });

        test('should fail to create comment with author name exceeding max length', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Comment Management');
            allure.story('Create Comment');
            allure.description('Verify that comment creation fails when author name exceeds maximum length');

            const longName = 'a'.repeat(101); // Max is 100 characters
            const invalidComment = {
                blogId: testBlogId,
                content: 'Valid content',
                authorName: longName
            };

            const response = await apiActions.post(`${apiUrl}/api/comments`, invalidComment);

            await apiActions.verifyStatusCode(response, 400);
            const body = await apiActions.getResponseJson<any>(response);
            expect(body.error).toContain('Author name');
        });

        test('should sanitize HTML in comment content', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Comment Management');
            allure.story('Create Comment');
            allure.description('Verify that HTML is sanitized in comment content');

            if (!testBlogId) {
                test.skip();
                return;
            }

            const commentWithHTML = {
                blogId: testBlogId,
                content: '<script>alert("XSS")</script>This is a test comment with HTML tags <b>bold</b>',
                authorName: 'Security Tester'
            };

            const response = await apiActions.post(`${apiUrl}/api/comments`, commentWithHTML);

            await apiActions.verifyStatusCode(response, 201);
            const body = await apiActions.getResponseJson<any>(response);

            // HTML should be stripped
            expect(body.content).not.toContain('<script>');
            expect(body.content).not.toContain('<b>');
        });

        test('should fail to create comment on non-existent blog', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Comment Management');
            allure.story('Create Comment');
            allure.description('Verify that comment creation fails for non-existent blog');

            const comment = {
                blogId: 999999,
                content: 'Comment on non-existent blog',
                authorName: 'Test User'
            };

            const response = await apiActions.post(`${apiUrl}/api/comments`, comment);

            await apiActions.verifyStatusCode(response, 404);
            const body = await apiActions.getResponseJson<any>(response);
            expect(body.error).toBe('Blog not found');
        });
    });

    test.describe('POST /api/comments/author - Create Comment as Author', () => {
        test('should create a comment as blog author', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Comment Management');
            allure.story('Author Comments');
            allure.description('Verify that blog author can create comments marked as author');

            if (!testBlogId) {
                test.skip();
                return;
            }

            const authorComment = {
                blogId: testBlogId,
                content: 'This is an author comment',
                authorName: 'Blog Author'
            };

            const response = await apiActions.post(`${apiUrl}/api/comments/author`, authorComment, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            await apiActions.verifyStatusCode(response, 201);
            const body = await apiActions.getResponseJson<any>(response);

            expect(body).toHaveProperty('id');
            expect(body.isAuthor).toBe(true);
            expect(body.content).toBe(authorComment.content);
        });

        test('should fail to create author comment without authentication', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Comment Management');
            allure.story('Author Comments');
            allure.description('Verify that author comment creation requires authentication');

            const authorComment = {
                blogId: testBlogId,
                content: 'Unauthorized author comment',
                authorName: 'Fake Author'
            };

            const response = await apiActions.post(`${apiUrl}/api/comments/author`, authorComment);

            await apiActions.verifyStatusCode(response, 401);
        });

        test('should fail to create author comment with missing content', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Comment Management');
            allure.story('Author Comments');
            allure.description('Verify that author comment creation fails with missing content');

            const invalidComment = {
                blogId: testBlogId,
                authorName: 'Author'
                // Missing content
            };

            const response = await apiActions.post(`${apiUrl}/api/comments/author`, invalidComment, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            await apiActions.verifyStatusCode(response, 400);
            const body = await apiActions.getResponseJson<any>(response);
            expect(body.error).toBe('Missing required fields');
        });
    });

    test.describe('DELETE /api/comments/:id - Delete Comment', () => {
        test('should delete a comment as blog author', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Comment Management');
            allure.story('Delete Comment');
            allure.description('Verify that blog author can delete comments');

            if (!createdCommentId) {
                test.skip();
                return;
            }

            const response = await apiActions.delete(`${apiUrl}/api/comments/${createdCommentId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            await apiActions.verifyStatusCode(response, 200);
            const body = await apiActions.getResponseJson<any>(response);
            expect(body.message).toBe('Comment deleted successfully');
        });

        test('should fail to delete comment without authentication', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Comment Management');
            allure.story('Delete Comment');
            allure.description('Verify that comment deletion requires authentication');

            const response = await apiActions.delete(`${apiUrl}/api/comments/1`);

            await apiActions.verifyStatusCode(response, 401);
        });

        test('should return 404 when deleting non-existent comment', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Comment Management');
            allure.story('Delete Comment');
            allure.description('Verify that 404 is returned when deleting non-existent comment');

            const response = await apiActions.delete(`${apiUrl}/api/comments/999999`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            await apiActions.verifyStatusCode(response, 404);
            const body = await apiActions.getResponseJson<any>(response);
            expect(body.error).toBe('Comment not found');
        });
    });
});

