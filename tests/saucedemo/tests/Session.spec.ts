import { test } from "@playwright/test"
import { VerifySuccessfulLogin, Login } from "../page-object-models/Login"


// This test uses the session saved by auth.setup.ts (configured in playwright.config.ts)
test("load session and verify logged in state", async ({ page }) => {
  await page.goto("/inventory.html")
  await VerifySuccessfulLogin(page)
})

// >> Example test for authenticate and save session for this test only
// const standard_user = { username: "standard_user", password: "secret_sauce" }
// const authFile = "playwright/.auth/user.json"
// test.describe("Tests with inline session setup", () => {
//   test("authenticate and verify logged in state", async ({ page }) => {
//     await page.goto("/")
//     await Login(page, standard_user)
//     await VerifySuccessfulLogin(page)
//     await page.context().storageState({ path: authFile })
//   })
//
//   test.describe("Using saved session", () => {
//     test.use({ storageState: authFile })
//
//     test("load session and verify logged in state", async ({ page }) => {
//       await page.goto("/inventory.html")
//       await VerifySuccessfulLogin(page)
//     })
//   })
// })
