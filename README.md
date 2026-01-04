# Playwright-e2e

Learning Playwright end-to-end testing with TypeScript.

## Projects

> ### Project (saucedemo.com + petstore.swagger.io)
>
> [![Playwright Tests](https://github.com/royalbrawler/Playwright-e2e/actions/workflows/playwright.yml/badge.svg)](https://github.com/royalbrawler/Playwright-e2e/actions/workflows/playwright.yml)
> | Project | Description |
> |---------|-------------|
> | `api-tests` | API tests against petstore.swagger.io |
> | `setup` | Authentication setup - saves session to `playwright/.auth/user.json` |
> | `chromium-with-session` | E2E tests on saucedemo.com using saved auth session |

## Getting Started

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps

# Run all tests
npx playwright test

# View test report
npx playwright show-report
```
