import { test } from "@playwright/test"
import { VerifySuccessfulLogin, Login } from "../page-object-models/login.page"

// This test uses the session saved by auth.setup.ts (configured in playwright.config.ts)
test("load session and verify logged in state", async ({ page }) => {
  await page.goto("/inventory.html")
  await VerifySuccessfulLogin(page)
})

// >> Example: save a session inside a test and reuse it in a later test of the same file.
// The setup project (auth.setup.ts) is the recommended way; this shows the mechanics behind it.
test.describe("Tests with inline session setup", () => {
  test.describe.configure({ mode: "serial" }) // the second test needs the file the first one writes
  test.use({ storageState: { cookies: [], origins: [] } }) // start logged out, ignore the project's session

  const standard_user = { username: "standard_user", password: "secret_sauce" }
  // One file per project: every browser project runs this file in parallel and would overwrite a shared one
  const authFile = (projectName: string) => `playwright/.auth/user_inline_example_${projectName}.json`

  test("authenticate and save session", async ({ page }, testInfo) => {
    await page.goto("/")
    await Login(page, standard_user)
    await VerifySuccessfulLogin(page)
    await page.context().storageState({ path: authFile(testInfo.project.name) })
  })

  test.describe("Using saved session", () => {
    // A fixture function instead of a fixed value, so the path can use the project name at run time
    test.use({ storageState: async ({}, use, testInfo) => use(authFile(testInfo.project.name)) })

    test("load session and verify logged in state", async ({ page }) => {
      await page.goto("/inventory.html")
      await VerifySuccessfulLogin(page)
    })
  })
})
