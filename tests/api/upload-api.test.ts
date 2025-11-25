import { testConfig } from '@/testConfig';
import { testData } from '@/testData/testData';
import test from '@lib/BaseTest';
import { expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import path from 'path';
import fs from 'fs';

test.describe('Upload API Tests', () => {
    const apiUrl = testConfig.apiUrl;
    const loginData = testData.loginData;
    let authToken: string;

    test.beforeAll(async ({ request }) => {
        const response = await request.post(`${apiUrl}/api/auth/login`, {
            data: loginData.loginValid
        });
        const body = await response.json();
        authToken = body.token;
    });

    test.describe('POST /api/upload - Upload Image', () => {
        test('should successfully upload an image', async ({ request }) => {
            allure.epic('API Tests');
            allure.feature('File Upload');
            allure.story('Image Upload');
            allure.description('Verify that authenticated users can upload images');

            const imagePath = path.join(__dirname, '../../testData/image.png');

            // Check if image exists
            if (!fs.existsSync(imagePath)) {
                console.log('Test image not found, skipping test');
                test.skip();
                return;
            }

            const response = await request.post(`${apiUrl}/api/upload`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                multipart: {
                    image: {
                        name: 'test-image.png',
                        mimeType: 'image/png',
                        buffer: fs.readFileSync(imagePath)
                    }
                }
            });

            expect(response.status()).toBe(200);
            const body = await response.json();

            expect(body).toHaveProperty('url');
            expect(body.url).toContain('/uploads/');
            expect(body.url).toMatch(/\.(png|jpg|jpeg|gif|webp)$/i);
        });

        test('should fail to upload without authentication', async ({ request }) => {
            allure.epic('API Tests');
            allure.feature('File Upload');
            allure.story('Image Upload');
            allure.description('Verify that image upload requires authentication');

            const imagePath = path.join(__dirname, '../../testData/image.png');

            if (!fs.existsSync(imagePath)) {
                test.skip();
                return;
            }

            const response = await request.post(`${apiUrl}/api/upload`, {
                multipart: {
                    image: {
                        name: 'test-image.png',
                        mimeType: 'image/png',
                        buffer: fs.readFileSync(imagePath)
                    }
                }
            });

            expect(response.status()).toBe(401);
        });

        test('should fail to upload without image file', async ({ request }) => {
            allure.epic('API Tests');
            allure.feature('File Upload');
            allure.story('Image Upload');
            allure.description('Verify that upload fails without providing an image');

            const response = await request.post(`${apiUrl}/api/upload`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                multipart: {}
            });

            expect(response.status()).toBe(400);
        });
    });

    test.describe('GET /uploads/:filename - Access Uploaded File', () => {
        test('should access uploaded file via URL', async ({ request }) => {
            allure.epic('API Tests');
            allure.feature('File Upload');
            allure.story('File Access');
            allure.description('Verify that uploaded files can be accessed via their URL');

            const imagePath = path.join(__dirname, '../../testData/image.png');

            if (!fs.existsSync(imagePath)) {
                test.skip();
                return;
            }

            // First upload an image
            const uploadResponse = await request.post(`${apiUrl}/api/upload`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                multipart: {
                    image: {
                        name: 'test-access.png',
                        mimeType: 'image/png',
                        buffer: fs.readFileSync(imagePath)
                    }
                }
            });

            expect(uploadResponse.status()).toBe(200);
            const uploadBody = await uploadResponse.json();
            const imageUrl = uploadBody.url;

            // Now try to access it
            const accessResponse = await request.get(`${apiUrl}${imageUrl}`);
            expect(accessResponse.status()).toBe(200);
            expect(accessResponse.headers()['content-type']).toMatch(/image\/(png|jpeg|jpg|gif|webp)/);
        });

        test('should return 404 for non-existent file', async ({ request }) => {
            allure.epic('API Tests');
            allure.feature('File Upload');
            allure.story('File Access');
            allure.description('Verify that 404 is returned for non-existent files');

            const response = await request.get(`${apiUrl}/uploads/non-existent-file-12345.png`);
            expect(response.status()).toBe(404);
        });
    });
});

