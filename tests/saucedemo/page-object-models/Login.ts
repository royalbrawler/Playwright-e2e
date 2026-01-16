import { expect, type Page } from "@playwright/test"

export async function Login(page: Page, user: { username: string; password: string }) {
  await page.locator('[data-test="username"]').fill(user.username)
  await page.locator('[data-test="password"]').fill(user.password)
  await page.locator('[data-test="login-button"]').click()
}

export async function VerifySuccessfulLogin(page: Page, errorMsg?: any, addExpectOptions = {}) {
  if (!errorMsg) errorMsg = page.locator('[data-test="error"]')
  await expect(page.locator('[data-test="login-button"]')).not.toBeVisible(addExpectOptions)
  await expect(page).toHaveURL(/inventory\.html/, addExpectOptions)
  await expect(errorMsg).toBeHidden(addExpectOptions)
  await page.getByRole("button", { name: "Open Menu" }).click()
  await expect(page.locator('[data-test="logout-sidebar-link"]')).toBeVisible(addExpectOptions)
}
