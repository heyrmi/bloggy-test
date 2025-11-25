import { APIRequestContext, APIResponse, expect } from "@playwright/test";

export interface RequestOptions {
    headers?: Record<string, string>;
    timeout?: number;
    retries?: number;
}

export class ApiActions {
    readonly requestContext: APIRequestContext;
    private defaultTimeout = 30000;

    constructor(requestContext: APIRequestContext) {
        this.requestContext = requestContext;
    }

    // HTTP Methods
    async get(url: string, options?: RequestOptions): Promise<APIResponse> {
        return await this.requestContext.get(url, {
            headers: options?.headers,
            timeout: options?.timeout || this.defaultTimeout
        });
    }

    async post(url: string, data: any, options?: RequestOptions): Promise<APIResponse> {
        return await this.requestContext.post(url, {
            data: data,
            headers: options?.headers,
            timeout: options?.timeout || this.defaultTimeout
        });
    }

    async put(url: string, data: any, options?: RequestOptions): Promise<APIResponse> {
        return await this.requestContext.put(url, {
            data: data,
            headers: options?.headers,
            timeout: options?.timeout || this.defaultTimeout
        });
    }

    async patch(url: string, data: any, options?: RequestOptions): Promise<APIResponse> {
        return await this.requestContext.patch(url, {
            data: data,
            headers: options?.headers,
            timeout: options?.timeout || this.defaultTimeout
        });
    }

    async delete(url: string, options?: RequestOptions): Promise<APIResponse> {
        return await this.requestContext.delete(url, {
            headers: options?.headers,
            timeout: options?.timeout || this.defaultTimeout
        });
    }

    async verifyStatusCode(response: APIResponse, expectedStatusCode: number): Promise<void> {
        if (expectedStatusCode) {
            expect(response.status(), `Expected status ${expectedStatusCode} but got ${response.status()}`)
                .toBe(expectedStatusCode);
        } else {
            await expect(response, 'API did not return 200-299 response code').toBeOK();
        }
    }

    async verifyResponseHeaders(response: APIResponse, expectedHeaders: string[] | Record<string, string>): Promise<void> {
        const headers = response.headers();
        if (Array.isArray(expectedHeaders)) {
            for (const header of expectedHeaders) {
                expect(headers, `Response missing header: ${header}`).toHaveProperty(header.toLowerCase());
            }
        } else {
            for (const [key, value] of Object.entries(expectedHeaders)) {
                expect(headers[key.toLowerCase()], `Header ${key} has unexpected value`).toBe(value);
            }
        }
    }

    async verifyResponseBodyFields(response: APIResponse, expectedFields: string[]): Promise<void> {
        const body = await response.json();

        for (const field of expectedFields) {
            const fieldPath = field.split('.');
            let current = body;
            for (const key of fieldPath) {
                expect(current, `Response body missing field: ${field}`).toHaveProperty(key);
                current = current[key];
            }
        }
    }

    async getResponseJson<T>(response: APIResponse): Promise<T> {
        return response.json() as T;
    }
}