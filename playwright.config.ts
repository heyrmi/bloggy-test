import { OrtoniReportConfig } from "ortoni-report";
import { defineConfig, devices } from "@playwright/test";
import { testConfig } from "@/testConfig";

const ENV = process.env.ENV || 'staging';

if (!ENV || !['staging', 'production', 'local'].includes(ENV)) {
    console.log(`Invalid ENV value: ${ENV}. Allowed values are 'local', 'staging' or 'production'.`);
    process.exit(1);
}

// HTML report configuration
const reportConfig: OrtoniReportConfig = {
    base64Image: true,
    title: `PW Test Blog App - ${ENV}`,
    showProject: true,
    authorName: 'Rahul Mishra',
    folderPath: `./html-reports/${ENV}`,
    filename: `pw-test-blog-app-${ENV}`,
    testType: 'E2E',
    port: 3600,
}

export default defineConfig({
    // Global setup to remove logs, html-reports, allure-results folders
    globalSetup: './global-setup.ts',

    // Test match pattern
    testMatch: [
        'tests/ui/**/*.test.ts',
        'tests/api/**/*.test.ts',
        // 'tests/db/**/*.test.ts',
    ],

    // Maximum time one test can run
    timeout: 60000, // 60 seconds per test

    // Expect timeout for assertions
    expect: {
        timeout: 10000 // 10 seconds for assertions
    },

    // Run tests in files in parallel
    fullyParallel: true,

    // Fail the build on CI
    forbidOnly: !!process.env.CI,

    // Retry on CI only
    retries: process.env.CI ? 2 : 0,

    // Parallel workers
    workers: process.env.CI ? 2 : undefined,

    outputDir: './test-results',

    preserveOutput: 'failures-only',

    // Reporter
    reporter: [
        // ['./reportConfig.ts'],
        ['allure-playwright', {
            outputFolder: `allure-results/${ENV}`,
            detail: true,
            suiteTitle: false
        }],
        ['html', { open: 'never', outputFolder: `./playwright-report/${ENV}` }],
        ['ortoni-report', reportConfig],
        ['list'] // Console reporter for better feedback during runs
    ],

    // Shared settings for all projects
    use: {
        baseURL: testConfig.uiUrl,

        // Timeouts
        actionTimeout: 15000,
        navigationTimeout: 30000,

        // Browser options
        ignoreHTTPSErrors: true,
        acceptDownloads: true,

        // Capture options
        video: process.env.CI ? 'retain-on-failure' : 'off',
        trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
        screenshot: 'only-on-failure',

        // Viewport
        viewport: { width: 1920, height: 1080 },

        // Locale & Timezone
        locale: 'en-IN',
        timezoneId: 'Asia/Kolkata',
    },

    projects: [
        {
            name: 'Chrome',
            use: {
                ...devices['Desktop Chrome'],
                headless: !!process.env.CI,
                launchOptions: {
                    slowMo: 1000,
                    args: [
                        '--start-maximized',
                        '--disable-blink-features=AutomationControlled'
                    ]
                }
            }
        },

        // {
        //     name: 'Firefox',
        //     use: {
        //         ...devices['Desktop Firefox'],
        //         headless: !!process.env.CI,
        //     }
        // },

        // {
        //     name: 'Safari',
        //     use: {
        //         ...devices['Desktop Safari'],
        //         headless: !!process.env.CI,
        //     }
        // },

        // // Mobile viewports
        // {
        //     name: 'Mobile Chrome',
        //     use: {
        //         ...devices['Pixel 5'],
        //     }
        // },

        // {
        //     name: 'Mobile Safari',
        //     use: {
        //         ...devices['iPhone 13'],
        //     }
        // }
    ]
})