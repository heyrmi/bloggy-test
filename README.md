# Bloggy Test Suite

This repository contains the automated test suite for the **Bloggy** application. It covers UI, API, and WebSocket-based real-time scenarios using Playwright with TypeScript. The goal of this suite is to provide reliable end-to-end coverage while demonstrating good test structure, maintainability, and modern automation practices.

## Why Playwright

Playwright was chosen for its:

- Support for UI and API testing within the same framework
- Native cross-browser support (Chromium, Firefox, WebKit)
- Auto-wait mechanisms that reduce flaky tests
- Strong TypeScript integration
- Built-in parallel execution and first-class debugging tools
- Ability to handle scenarios like authentication, file uploads, and network interception

## Project Structure

```
test/
├── lib/                      # Core reusable utilities
│   ├── ApiActions.ts         # Typed API helpers (GET, POST, PUT, DELETE)
│   ├── BaseTest.ts           # Custom Playwright fixture with page injection
│   └── utils/
│       ├── FileUtils.ts      # File read/write helpers
│       └── Logger.ts         # Winston logger setup
├── pageFactory/              # Page Object Model (POM)
│   ├── AdminPage.ts
│   ├── CreateBlogPage.ts
│   ├── HomePage.ts
│   ├── LoginPage.ts
│   └── PublishedBlogPage.ts
├── testData/
│   ├── blogPosts.json
│   ├── image.png
│   ├── login.json
│   └── testData.ts
├── tests/
│   ├── api/
│   │   ├── auth-api.test.ts
│   │   ├── blog-api.test.ts
│   │   ├── comment-api.test.ts
│   │   ├── health-api.test.ts
│   │   └── upload-api.test.ts
│   └── ui/
│       ├── admin.test.ts
│       ├── create-blog.test.ts
│       ├── homepage.test.ts
│       ├── loginpage.test.ts
│       ├── realtime-comments.test.ts
│       └── session-persistence.test.ts
├── global-setup.ts
├── playwright.config.ts
├── reportConfig.ts
├── testConfig.ts
└── tsconfig.json
```

The suite uses the Page Object Model, custom fixtures, shared utilities, and environment-based configuration.

## Getting Started

### Prerequisites

- Node.js v20+
- npm v10+
- Running instance of the **Bloggy** application

### Setting Up the Bloggy Application

```bash
cd bloggy
npm install
npm run seed
npm run dev
```

Default services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

Admin (after seed):

- Username: `admin`
- Password: `admin123`

### Setting Up the Test Suite

```bash
cd test
npm install
npm run install:browsers
```

### Environment Configuration

You may create a `.env` file in the test root:

```
ENV=local
UI_BASE_URL=http://localhost:5173
API_BASE_URL=http://localhost:3001
TEST_USERNAME=admin
TEST_PASSWORD=admin123
```

All values have defaults via `testConfig.ts`, so `.env` is optional for local runs.

## Running Tests

### All Tests

```bash
npm test
```

### Common Modes

```bash
npm run test:headed
npm run test:ui
npm run test:debug
```

### Running Specific Suites

API tests:

```bash
npm test tests/api
npm run test:api:auth
npm run test:api:blog
```

Browsers:

```bash
npm run test:chrome
npm run test:firefox # needs setup in the 'projects' in playwright.config.ts
npm run test:safari # needs setup in the 'projects' in playwright.config.ts
```

Parallel / serial:

```bash
npm run test:parallel
npm run test:serial
```

## Test Reports

### Playwright HTML Report

```bash
npm run report
```

### Allure Report

```bash
npm run report:allure
```

### Custom HTML Reports (Ortoni)

Generated automatically under:

```
./html-reports/{ENV}/
```

## Test Coverage Summary

Below is a high-level summary of what is covered.

### UI Tests

#### Homepage

- Header/navigation checks
- Theme toggle
- Blog search
- Navigation to admin login

#### Login

- Form display and validation
- Successful login
- Invalid credential handling

#### Admin Dashboard

- Table and metadata checks
- View/Edit/Delete operations
- Pagination
- Responsive testing
- Performance checks

#### Blog Creation

- Form interactions
- Rich-text editor actions
- Image upload
- Draft/publish flows
- Validation
- Accessibility checks

#### Session Persistence

- Theme persistence (dark/light)
- Read-blog tracking across sessions
- LocalStorage sync across tabs

#### Real-Time Comments (WebSocket)

- Connection lifecycle
- Real-time updates
- Multi-user commenting
- Typing indicators
- Reconnection scenario

### API Tests

#### Authentication

- Valid/invalid login
- JWT validation

#### Blog API

- Pagination
- Blog retrieval
- Blog CRUD operations
- Category/tag filters
- Likes
- Admin endpoints
- Validation and error handling

#### Comment API

- Add/delete comments
- Anonymous vs authenticated

#### Upload API

- Image uploads
- Size/type validations

#### Health API

- Health check
- DB connectivity check

## Key Features in This Suite

### Page Object Model

Reduces code duplication and simplifies test maintenance.

### Custom Fixtures

Provides:

- Automatically injected page objects
- API helper instance
- Shared context for UI/API

### API Testing Layer

`ApiActions` offers reusable typed API calls with structured assertions.

### Dynamic & Static Test Data

Supports JSON-based static data and dynamic data generation (with Faker).

### Logging

Winston-based logging for easier debugging.

### Environment Support

Switch between local, staging, and production through configuration.

### WebSocket Testing

Covers real-time messaging, event monitoring, and multi-user flows.

### Session Persistence Tests

Verifies browser storage behavior and cross-tab synchronization.

## Notable Patterns Used

- `.serial` tests for data-dependent API sequences
- `test.step` for structured flows
- Timestamp-based unique test data
- Reusable authentication state for API tests
- Multiple browser contexts to simulate multiple users
- WebSocket event inspection via event listeners

## Configuration Overview

Key settings in `playwright.config.ts`:

- 60s test timeout
- 10s assertion timeout
- Parallel execution enabled
- Retries: 0 (local), 2 (CI)
- Screenshots, traces, and videos on failure
- Chrome as default browser
- 1920×1080 viewport
- India locale + timezone

## Debugging Tips

- Use inspector: `npm run test:debug`
- Run headed mode
- Review logs in `./logs/`
- Review traces in Playwright report
- Check WebSocket events in console (headed mode)
- Inspect browser storage through DevTools
