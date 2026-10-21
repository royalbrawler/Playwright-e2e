# Playwright-e2e

Learning Playwright end-to-end testing with TypeScript.

## Projects

[![Playwright Tests](https://github.com/royalbrawler/Playwright-e2e/actions/workflows/playwright.yml/badge.svg)](https://github.com/royalbrawler/Playwright-e2e/actions/workflows/playwright.yml)

| Project | Folder | Description |
| ------- | ------ | ----------- |
| `petstore-api` | `tests/petstore/api/` | API tests against petstore.swagger.io |
| `saucedemo-setup` | `tests/saucedemo/setup/` | Authentication setup - saves session to `playwright/.auth/user_saucedemo.json` |
| `saucedemo-e2e-chromium` | `tests/saucedemo/e2e/` | E2E tests on saucedemo.com using saved auth session (Chromium) |
| `saucedemo-e2e-firefox` | `tests/saucedemo/e2e/` | E2E tests on saucedemo.com using saved auth session (Firefox) |
| `saucedemo-e2e-webkit` | `tests/saucedemo/e2e/` | E2E tests on saucedemo.com using saved auth session (WebKit / Safari) |

## Getting Started

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps

# Run all tests
npx playwright test

# Run specific project (saucedemo e2e projects run saucedemo-setup first automatically)
npx playwright test --project=saucedemo-e2e-chromium
npx playwright test --project=petstore-api

# Wildcards: one site in every browser, or one browser across every site
npx playwright test --project="saucedemo*"
npx playwright test --project="*firefox"

# View test report
npx playwright show-report
```

## Allure Report

```bash
npx allure run -- npx playwright test
```

Open `allure-report/index.html` in a browser. CI uploads it as the `allure-report` artifact.
