# Playwright-e2e

Learning Playwright end-to-end testing with TypeScript.

## Projects

[![Playwright Tests](https://github.com/royalbrawler/Playwright-e2e/actions/workflows/playwright.yml/badge.svg)](https://github.com/royalbrawler/Playwright-e2e/actions/workflows/playwright.yml)

| Project | Description |
|---------|-------------|
| `petstore-api-tests` | API tests against petstore.swagger.io |
| `setup-saucedemo` | Authentication setup - saves session to `playwright/.auth/user_saucedemo.json` |
| `saucedemo-tests` | E2E tests on saucedemo.com using saved auth session |

## Getting Started

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps

# Run all tests
npx playwright test

# Run specific project
npx playwright test --project=saucedemo-tests
npx playwright test --project=petstore-api-tests

# View test report
npx playwright show-report
```
