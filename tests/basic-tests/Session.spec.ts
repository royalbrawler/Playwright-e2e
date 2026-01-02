import { test } from "@playwright/test"
import { VerifySuccessfulLogin } from "../page-object-models/Login"

// This test uses the session saved by auth.setup.ts (configured in playwright.config.ts)
test("load session and verify logged in state", async ({ page }) => {
  await page.goto("/inventory.html")
  await VerifySuccessfulLogin(page)
})
