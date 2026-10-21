# Playwright-e2e

Learning Playwright end-to-end testing with TypeScript.

## Projects

[![Playwright Tests](https://github.com/royalbrawler/Playwright-e2e/actions/workflows/playwright.yml/badge.svg)](https://github.com/royalbrawler/Playwright-e2e/actions/workflows/playwright.yml)

| Project | Folder | Description |
| ------- | ------ | ----------- |
| `petstore-api` | `tests/petstore_swagger/` | API tests against petstore.swagger.io |
| `saucedemo-setup` | `tests/saucedemo/setup/` | Authentication setup - saves session to `playwright/.auth/user_saucedemo.json` |
| `saucedemo-e2e` | `tests/saucedemo/tests/` | E2E tests on saucedemo.com using saved auth session |

## Getting Started

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps

# Run all tests
npx playwright test

# Run specific project (saucedemo-e2e runs saucedemo-setup first automatically)
npx playwright test --project=saucedemo-e2e
npx playwright test --project=petstore-api

# View test report
npx playwright show-report
```

## Allure Report

The `allure-playwright` reporter writes raw results to `allure-results/` on every run. Allure 3 (`allurerc.mjs`) turns them into a single-file report, `allure-report/index.html`, which opens directly in a browser.

```bash
# Run tests and build a fresh report (ignores results left over from earlier runs)
npx allure run -- npx playwright test

# Build a report from whatever is in allure-results/ (older runs show up as retries)
npx allure generate allure-results
```

In CI the report is uploaded as the `allure-report` artifact, next to `playwright-report`.
