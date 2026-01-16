import test, { expect } from "@playwright/test"
import { Login, VerifySuccessfulLogin } from "../page-object-models/Login"

const standard_user = { username: "standard_user", password: "secret_sauce" }
const locked_out_user = { username: "locked_out_user", password: "secret_sauce" }
const invalid_user = { username: "invalid_user", password: "wrong_password" }
const performance_glitch_user = { username: "performance_glitch_user", password: "secret_sauce" }

test.describe("Login tests", () => {
  test("Valid user can log in", async ({ page }) => {
    await page.goto("/")
    await Login(page, standard_user)
    const errorMsg = page.locator('[data-test="error"]')

    await VerifySuccessfulLogin(page, errorMsg)
  })
  test("Locked out user cannot log in", async ({ page }) => {
    await page.goto("/")
    await Login(page, locked_out_user)
    const errorMsg = page.locator('[data-test="error"]')

    expect(errorMsg).toBeVisible()
    await expect(errorMsg).toContainText("Epic sadface: Sorry, this user has been locked out.")
  })
  test("Invalid user cannot log in", async ({ page }) => {
    await page.goto("/")
    await Login(page, invalid_user)
    const errorMsg = page.locator('[data-test="error"]')

    expect(errorMsg).toBeVisible()
    await expect(errorMsg).toContainText("Epic sadface: Username and password do not match any user in this service")
  })
  test("Performance glitch user can log in", { tag: "@slow" }, async ({ page }) => {
    test.slow()

    await page.goto("/")
    await Login(page, performance_glitch_user)
    const errorMsg = page.locator('[data-test="error"]')

    await VerifySuccessfulLogin(page, errorMsg, { timeout: 60_000 })
  })
})
