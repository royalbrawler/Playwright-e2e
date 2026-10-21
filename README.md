# Playwright-e2e

Learning Playwright end-to-end testing with TypeScript.

## Projects

[![Playwright Tests](https://github.com/royalbrawler/Playwright-e2e/actions/workflows/playwright.yml/badge.svg)](https://github.com/royalbrawler/Playwright-e2e/actions/workflows/playwright.yml)

| Project | Folder | Description |
| ------- | ------ | ----------- |
| `petstore-api` | `tests/petstore/api/` | API tests against petstore.swagger.io |
| `saucedemo-setup` | `tests/saucedemo/setup/` | Authentication setup - saves session to `playwright/.auth/user_saucedemo.json` |
| `saucedemo-e2e` | `tests/saucedemo/e2e/` | E2E tests on saucedemo.com using saved auth session |

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

```bash
npx allure run -- npx playwright test
```

Open `allure-report/index.html` in a browser. CI uploads it as the `allure-report` artifact.
