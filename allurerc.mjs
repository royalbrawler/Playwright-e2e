import { defineConfig } from 'allure';

// Allure 3 config, read by `npx allure generate allure-results`
export default defineConfig({
  name: 'Playwright-e2e',
  output: './allure-report',
  plugins: {
    awesome: {
      options: {
        // One self-contained index.html: opens straight from disk (e.g. the unzipped CI artifact), no server needed
        singleFile: true,
        // allure-playwright sets parentSuite = Playwright project (one per site), suite = file, subSuite = describe
        groupBy: ['parentSuite', 'suite', 'subSuite'],
      },
    },
  },
});
