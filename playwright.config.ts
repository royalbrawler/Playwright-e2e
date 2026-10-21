import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/* One base URL per site. There is no global baseURL: a project that forgets its own
   fails on the first relative goto/request instead of silently testing another site. */
const SAUCEDEMO_URL = 'https://www.saucedemo.com/';
const PETSTORE_URL = 'https://petstore.swagger.io/v2/';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  /* allure-playwright writes raw results to allure-results/; `npx allure generate allure-results` builds the report */
  reporter: [['html'], ['list'], ['allure-playwright', { resultsDir: 'allure-results' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* No baseURL here: each site's projects set their own (see the constants above). */

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Projects are grouped per site and named "<site>-<type>", so `--project="<site>*"` selects a whole site */
  projects: [
    // ── petstore.swagger.io ──
    // API tests (request fixture only, no browser)
    {
      name: 'petstore-api',
      testDir: './tests/petstore/api',
      use: {
        baseURL: PETSTORE_URL,
        // No Content-Type here: it overrides Playwright's per-request type and breaks form/multipart (415)
        extraHTTPHeaders: {
          'Accept': 'application/json',
        },
      },
    },

    // ── saucedemo.com ──
    // Setup project - runs first to authenticate and save session
    {
      name: 'saucedemo-setup',
      testDir: './tests/saucedemo/setup',
      testMatch: /.*\.setup\.ts/,
      use: {
        baseURL: SAUCEDEMO_URL,
      },
    },
    // E2E tests using the saved session, once per browser. The session file is plain JSON
    // (cookies + localStorage), so one setup run serves every browser.
    {
      name: 'saucedemo-e2e-chromium',
      testDir: './tests/saucedemo/e2e',
      use: {
        baseURL: SAUCEDEMO_URL,
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user_saucedemo.json',
      },
      dependencies: ['saucedemo-setup'],
    },
    {
      name: 'saucedemo-e2e-firefox',
      testDir: './tests/saucedemo/e2e',
      use: {
        baseURL: SAUCEDEMO_URL,
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/user_saucedemo.json',
      },
      dependencies: ['saucedemo-setup'],
    },
    // WebKit is Safari's engine; Playwright's build is the closest to Safari you can run on Windows/Linux
    {
      name: 'saucedemo-e2e-webkit',
      testDir: './tests/saucedemo/e2e',
      use: {
        baseURL: SAUCEDEMO_URL,
        ...devices['Desktop Safari'],
        storageState: 'playwright/.auth/user_saucedemo.json',
      },
      dependencies: ['saucedemo-setup'],
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
