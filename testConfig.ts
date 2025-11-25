import dotenv from 'dotenv';

dotenv.config();

export const testConfig = {
    env: process.env.ENV || 'staging',

    uiUrl: process.env.UI_BASE_URL || 'http://localhost:5173',
    apiUrl: process.env.API_BASE_URL || 'http://localhost:3001',

    username: process.env.TEST_USERNAME || 'admin',
    password: process.env.TEST_PASSWORD || 'admin123',

    db: {
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'root',
        name: process.env.DB_NAME || 'blog_test',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    }

    // Add more test configuration variables here
} as const;