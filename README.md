# Playwright-e2e

Learning Playwright end-to-end testing with TypeScript.

## Projects

[![Playwright Tests](https://github.com/royalbrawler/Playwright-e2e/actions/workflows/playwright.yml/badge.svg)](https://github.com/royalbrawler/Playwright-e2e/actions/workflows/playwright.yml)

| Project | Description |
|---------|-------------|
| `petstore-api-tests` | API tests against petstore.swagger.io |
| `setup-saucedemo` | Authentication setup - saves session to `playwright/.auth/user_saucedemo.json` |
| `chromium-with-session` | E2E tests on saucedemo.com using saved auth session |

## Folder Structure

```
tests/
├── saucedemo/                      # SauceDemo UI tests
│   ├── page-object-models/         # POM helper functions
│   │   ├── Cart.ts
│   │   ├── Login.ts
│   │   └── Products.ts
│   ├── setup/                      # Authentication setup
│   │   └── auth.setup.ts
│   └── tests/                      # Test specs
│       ├── ApiIntercept.spec.ts
│       ├── Cart.spec.ts
│       ├── Cart_POM.spec.ts
│       ├── Login.spec.ts
│       ├── ResourceBlock.spec.ts
│       └── Session.spec.ts
│
└── petstore_swagger/               # Petstore API tests
    └── api-tests/
        ├── store.spec.ts
        └── user.spec.ts
```

## Getting Started

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps

# Run all tests
npx playwright test

# Run specific project
npx playwright test --project=chromium-with-session
npx playwright test --project=petstore-api-tests

# View test report
npx playwright show-report
```
