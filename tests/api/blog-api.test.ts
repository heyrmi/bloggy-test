import { testConfig } from '@/testConfig';
import { testData } from '@/testData/testData';
import test from '@lib/BaseTest';
import { expect } from '@playwright/test';
import * as allure from 'allure-js-commons';

test.describe.serial('Blog API Tests', () => {
    const apiUrl = testConfig.apiUrl;
    const loginData = testData.loginData;
    let authToken: string;
    let createdBlogId: number;

    test.beforeAll(async ({ request }) => {
        const response = await request.post(`${apiUrl}/api/auth/login`, {
            data: loginData.loginValid
        });
        const body = await response.json();
        authToken = body.token;
    });

    test.describe('GET /api/blogs/public - Get All Published Blogs', () => {
        test('should return all published blogs', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Blog Management');
            allure.story('Get Blogs');
            allure.description('Verify that public endpoint returns all published blogs');

            const response = await apiActions.get(`${apiUrl}/api/blogs/public`);

            await apiActions.verifyStatusCode(response, 200);
            await apiActions.verifyResponseHeaders(response, ['content-type']);
            await apiActions.verifyResponseBodyFields(response, ['data', 'pagination']);

            const body = await apiActions.getResponseJson<any>(response);
            expect(body.data).toBeInstanceOf(Array);
            expect(body.pagination).toHaveProperty('page');
            expect(body.pagination).toHaveProperty('limit');
            expect(body.pagination).toHaveProperty('total');
            expect(body.pagination).toHaveProperty('totalPages');

            if (body.data.length > 0) {
                body.data.forEach((blog: any) => {
                    expect(blog).toHaveProperty('id');
                    expect(blog).toHaveProperty('title');
                    expect(blog).toHaveProperty('excerpt');
                    expect(blog).toHaveProperty('category');
                    expect(blog).toHaveProperty('tags');
                    expect(blog).toHaveProperty('status');
                    expect(blog.status).toBe('published');
                });
            }
        });

        test('should support pagination', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Blog Management');
            allure.story('Get Blogs');
            allure.description('Verify that pagination works correctly');

            const response = await apiActions.get(`${apiUrl}/api/blogs/public?page=1&limit=5`);

            await apiActions.verifyStatusCode(response, 200);
            const body = await apiActions.getResponseJson<any>(response);

            expect(body.pagination.page).toBe(1);
            expect(body.pagination.limit).toBe(5);
            expect(body.data.length).toBeLessThanOrEqual(5);
        });
    });

    test.describe('GET /api/blogs/public/:id - Get Blog by ID', () => {
        test('should return a published blog by ID', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Blog Management');
            allure.story('Get Blog Details');
            allure.description('Verify that a published blog can be retrieved by ID');

            // First get a published blog ID
            const listResponse = await apiActions.get(`${apiUrl}/api/blogs/public?limit=1`);
            const listBody = await apiActions.getResponseJson<any>(listResponse);

            if (listBody.data.length === 0) {
                test.skip();
                return;
            }

            const blogId = listBody.data[0].id;

            // Get the blog by ID
            const response = await apiActions.get(`${apiUrl}/api/blogs/public/${blogId}`);

            await apiActions.verifyStatusCode(response, 200);
            const body = await apiActions.getResponseJson<any>(response);

            expect(body).toHaveProperty('id', blogId);
            expect(body).toHaveProperty('title');
            expect(body).toHaveProperty('content');
            expect(body).toHaveProperty('excerpt');
            expect(body).toHaveProperty('category');
            expect(body).toHaveProperty('tags');
            expect(body).toHaveProperty('status', 'published');
            expect(body).toHaveProperty('views');
            expect(body).toHaveProperty('likes');
        });

        test('should return 404 for non-existent blog', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Blog Management');
            allure.story('Get Blog Details');
            allure.description('Verify that 404 is returned for non-existent blog ID');

            const response = await apiActions.get(`${apiUrl}/api/blogs/public/999999`);

            await apiActions.verifyStatusCode(response, 404);
            const body = await apiActions.getResponseJson<any>(response);
            expect(body.error).toBe('Blog not found');
        });

        test('should increment view count when blog is viewed', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Blog Management');
            allure.story('Blog Analytics');
            allure.description('Verify that view count increments when blog is accessed');

            // Get a published blog
            const listResponse = await apiActions.get(`${apiUrl}/api/blogs/public?limit=1`);
            const listBody = await apiActions.getResponseJson<any>(listResponse);

            if (listBody.data.length === 0) {
                test.skip();
                return;
            }

            const blogId = listBody.data[0].id;

            // View the blog first time
            const response1 = await apiActions.get(`${apiUrl}/api/blogs/public/${blogId}`);
            const body1 = await apiActions.getResponseJson<any>(response1);
            const initialViews = body1.views;

            // View the blog second time
            const response2 = await apiActions.get(`${apiUrl}/api/blogs/public/${blogId}`);
            const body2 = await apiActions.getResponseJson<any>(response2);

            expect(body2.views).toBe(initialViews + 1);
        });
    });

    test.describe('GET /api/blogs/search - Search Blogs', () => {
        test('should search blogs by query', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Blog Management');
            allure.story('Search Blogs');
            allure.description('Verify that blogs can be searched by text query');

            const response = await apiActions.get(`${apiUrl}/api/blogs/search?query=test`);

            await apiActions.verifyStatusCode(response, 200);
            const body = await apiActions.getResponseJson<any>(response);

            expect(body).toHaveProperty('data');
            expect(body).toHaveProperty('pagination');
            expect(body.data).toBeInstanceOf(Array);
        });

        test('should filter blogs by category', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Blog Management');
            allure.story('Search Blogs');
            allure.description('Verify that blogs can be filtered by category');

            // Get available categories first
            const catResponse = await apiActions.get(`${apiUrl}/api/blogs/categories`);
            const categories = await apiActions.getResponseJson<any>(catResponse);

            if (categories.length === 0) {
                test.skip();
                return;
            }

            const category = categories[0];

            const response = await apiActions.get(`${apiUrl}/api/blogs/search?category=${encodeURIComponent(category)}`);

            await apiActions.verifyStatusCode(response, 200);
            const body = await apiActions.getResponseJson<any>(response);

            // All returned blogs should have the filtered category
            body.data.forEach((blog: any) => {
                expect(blog.category).toBe(category);
            });
        });

        test('should filter blogs by tags', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Blog Management');
            allure.story('Search Blogs');
            allure.description('Verify that blogs can be filtered by tags');

            const response = await apiActions.get(`${apiUrl}/api/blogs/search?tags=React,JavaScript`);

            await apiActions.verifyStatusCode(response, 200);
            const body = await apiActions.getResponseJson<any>(response);

            expect(body).toHaveProperty('data');
            expect(body.data).toBeInstanceOf(Array);
        });
    });

    test.describe('GET /api/blogs/categories - Get Categories', () => {
        test('should return list of categories', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Blog Management');
            allure.story('Categories');
            allure.description('Verify that all blog categories can be retrieved');

            const response = await apiActions.get(`${apiUrl}/api/blogs/categories`);

            await apiActions.verifyStatusCode(response, 200);
            const body = await apiActions.getResponseJson<any>(response);

            expect(body).toBeInstanceOf(Array);
        });
    });

    test.describe('POST /api/blogs/:id/like - Like a Blog', () => {
        test('should successfully like a blog', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Blog Management');
            allure.story('Blog Interactions');
            allure.description('Verify that a blog can be liked');

            // Get a published blog
            const listResponse = await apiActions.get(`${apiUrl}/api/blogs/public?limit=1`);
            const listBody = await apiActions.getResponseJson<any>(listResponse);

            if (listBody.data.length === 0) {
                test.skip();
                return;
            }

            const blogId = listBody.data[0].id;

            // Like the blog
            const response = await apiActions.post(`${apiUrl}/api/blogs/${blogId}/like`, {});

            await apiActions.verifyStatusCode(response, 200);
            const body = await apiActions.getResponseJson<any>(response);

            expect(body).toHaveProperty('likes');
            expect(typeof body.likes).toBe('number');
            expect(body.likes).toBeGreaterThan(0);
        });

        test('should return 404 when liking non-existent blog', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Blog Management');
            allure.story('Blog Interactions');
            allure.description('Verify that 404 is returned when liking non-existent blog');

            const response = await apiActions.post(`${apiUrl}/api/blogs/999999/like`, {});

            await apiActions.verifyStatusCode(response, 404);
            const body = await apiActions.getResponseJson<any>(response);
            expect(body.error).toBe('Blog not found');
        });
    });

    test.describe('GET /api/blogs/admin - Admin Get All Blogs', () => {
        test('should return all blogs including drafts for authenticated admin', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Blog Management');
            allure.story('Admin Operations');
            allure.description('Verify that admin can view all blogs including drafts');

            const response = await apiActions.get(`${apiUrl}/api/blogs/admin`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            await apiActions.verifyStatusCode(response, 200);
            const body = await apiActions.getResponseJson<any>(response);

            expect(body).toHaveProperty('data');
            expect(body).toHaveProperty('pagination');
            expect(body.data).toBeInstanceOf(Array);
        });

        test('should return 401 without authentication token', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Blog Management');
            allure.story('Admin Operations');
            allure.description('Verify that admin endpoints require authentication');

            const response = await apiActions.get(`${apiUrl}/api/blogs/admin`);

            await apiActions.verifyStatusCode(response, 401);
        });
    });

    test.describe('POST /api/blogs - Create Blog', () => {
        test('should create a new blog post as draft', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Blog Management');
            allure.story('Create Blog');
            allure.description('Verify that authenticated user can create a draft blog post');

            const timestamp = Date.now();
            const newBlog = {
                title: `API Test Blog ${timestamp}`,
                excerpt: 'This is a test blog created via API',
                content: '<p>This is the content of the test blog post.</p>',
                category: 'Technology',
                tags: ['React'],
                status: 'draft'
            };

            const response = await apiActions.post(`${apiUrl}/api/blogs`, newBlog, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            await apiActions.verifyStatusCode(response, 201);
            const body = await apiActions.getResponseJson<any>(response);

            expect(body).toHaveProperty('id');
            expect(body.title).toBe(newBlog.title);
            expect(body.excerpt).toBe(newBlog.excerpt);
            expect(body.content).toBe(newBlog.content);
            expect(body.category).toBe(newBlog.category);
            expect(body.tags).toEqual(newBlog.tags);
            expect(body.status).toBe('draft');

            createdBlogId = body.id;
        });

        test('should create a new blog post as published', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Blog Management');
            allure.story('Create Blog');
            allure.description('Verify that authenticated user can create a published blog post');

            const timestamp = Date.now();
            const newBlog = {
                title: `Published API Test Blog ${timestamp}`,
                excerpt: 'This is a published test blog',
                content: '<p>Published content</p>',
                category: 'Design',
                tags: ['News'],
                status: 'published'
            };

            const response = await apiActions.post(`${apiUrl}/api/blogs`, newBlog, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            await apiActions.verifyStatusCode(response, 201);
            const body = await apiActions.getResponseJson<any>(response);

            expect(body.status).toBe('published');
        });

        test('should fail to create blog without authentication', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Blog Management');
            allure.story('Create Blog');
            allure.description('Verify that blog creation requires authentication');

            const newBlog = {
                title: 'Unauthorized Blog',
                excerpt: 'This should fail',
                content: '<p>Content</p>',
                category: 'Other',
                tags: ['Python'],
                status: 'draft'
            };

            const response = await apiActions.post(`${apiUrl}/api/blogs`, newBlog);

            await apiActions.verifyStatusCode(response, 401);
        });

        test('should fail to create blog with missing required fields', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Blog Management');
            allure.story('Create Blog');
            allure.description('Verify that blog creation fails with missing required fields');

            const invalidBlog = {
                title: 'Incomplete Blog'
            };

            const response = await apiActions.post(`${apiUrl}/api/blogs`, invalidBlog, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            await apiActions.verifyStatusCode(response, 400);
            const body = await apiActions.getResponseJson<any>(response);
            expect(body.error).toBe('Missing required fields');
        });
    });

    test.describe('PUT /api/blogs/:id - Update Blog', () => {
        test('should update an existing blog', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Blog Management');
            allure.story('Update Blog');
            allure.description('Verify that authenticated user can update their blog');

            if (!createdBlogId) {
                test.skip();
                return;
            }

            const updatedData = {
                title: 'Updated API Test Blog',
                excerpt: 'Updated excerpt',
                status: 'published'
            };

            const response = await apiActions.put(`${apiUrl}/api/blogs/${createdBlogId}`, updatedData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            await apiActions.verifyStatusCode(response, 200);
            const body = await apiActions.getResponseJson<any>(response);

            expect(body.title).toBe(updatedData.title);
            expect(body.excerpt).toBe(updatedData.excerpt);
            expect(body.status).toBe('published');
        });

        test('should fail to update blog without authentication', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Blog Management');
            allure.story('Update Blog');
            allure.description('Verify that blog update requires authentication');

            if (!createdBlogId) {
                test.skip();
                return;
            }

            const response = await apiActions.put(`${apiUrl}/api/blogs/${createdBlogId}`, { title: 'Hacked' });

            await apiActions.verifyStatusCode(response, 401);
        });

        test('should return 404 when updating non-existent blog', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Blog Management');
            allure.story('Update Blog');
            allure.description('Verify that 404 is returned when updating non-existent blog');

            const response = await apiActions.put(`${apiUrl}/api/blogs/999999`, { title: 'Does not exist' }, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            await apiActions.verifyStatusCode(response, 404);
            const body = await apiActions.getResponseJson<any>(response);
            expect(body.error).toBe('Blog not found');
        });
    });

    test.describe('DELETE /api/blogs/:id - Delete Blog', () => {
        test('should delete an existing blog', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Blog Management');
            allure.story('Delete Blog');
            allure.description('Verify that authenticated user can delete their blog');

            if (!createdBlogId) {
                test.skip();
                return;
            }

            const response = await apiActions.delete(`${apiUrl}/api/blogs/${createdBlogId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            await apiActions.verifyStatusCode(response, 200);
            const body = await apiActions.getResponseJson<any>(response);
            expect(body.message).toBe('Blog deleted successfully');

            const getResponse = await apiActions.get(`${apiUrl}/api/blogs/admin/${createdBlogId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            await apiActions.verifyStatusCode(getResponse, 404);
        });

        test('should fail to delete blog without authentication', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Blog Management');
            allure.story('Delete Blog');
            allure.description('Verify that blog deletion requires authentication');

            const response = await apiActions.delete(`${apiUrl}/api/blogs/1`);

            await apiActions.verifyStatusCode(response, 401);
        });

        test('should return 404 when deleting non-existent blog', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Blog Management');
            allure.story('Delete Blog');
            allure.description('Verify that 404 is returned when deleting non-existent blog');

            const response = await apiActions.delete(`${apiUrl}/api/blogs/999999`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            await apiActions.verifyStatusCode(response, 404);
            const body = await apiActions.getResponseJson<any>(response);
            expect(body.error).toBe('Blog not found');
        });
    });
});
