import { testConfig } from '@/testConfig';
import test from '@lib/BaseTest';
import { expect } from '@playwright/test';
import * as allure from 'allure-js-commons';

test.describe('Health Check API Tests', () => {
    const apiUrl = testConfig.apiUrl;

    test.describe('GET /api/health - Health Check', () => {
        test('should return healthy status', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Health Check');
            allure.story('Server Health');
            allure.description('Verify that server health check endpoint returns OK status');

            const response = await apiActions.get(`${apiUrl}/api/health`);

            await apiActions.verifyStatusCode(response, 200);
            await apiActions.verifyResponseBodyFields(response, ['status', 'timestamp']);

            const body = await apiActions.getResponseJson<any>(response);
            expect(body.status).toBe('ok');
            expect(body.timestamp).toBeTruthy();

            // Verify timestamp is valid ISO 8601 format
            const timestamp = new Date(body.timestamp);
            expect(timestamp.toString()).not.toBe('Invalid Date');
        });

        test('should have correct response time', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Health Check');
            allure.story('Performance');
            allure.description('Verify that health check endpoint responds quickly');

            const startTime = Date.now();
            const response = await apiActions.get(`${apiUrl}/api/health`);
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            await apiActions.verifyStatusCode(response, 200);

            // Health check should respond within 1 second
            expect(responseTime).toBeLessThan(1000);

            allure.attachment('Response Time', `${responseTime}ms`, 'text/plain');
        });

        test('should return correct content-type header', async ({ apiActions }) => {
            allure.epic('API Tests');
            allure.feature('Health Check');
            allure.story('Response Headers');
            allure.description('Verify that health check returns JSON content-type');

            const response = await apiActions.get(`${apiUrl}/api/health`);

            await apiActions.verifyStatusCode(response, 200);
            await apiActions.verifyResponseHeaders(response, ['content-type']);

            const headers = response.headers();
            expect(headers['content-type']).toContain('application/json');
        });
    });
});

