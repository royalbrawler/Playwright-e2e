import { expect, type Page } from "@playwright/test"

export async function Login(page: Page, user: { username: string; password: string }) {
  await page.locator('[data-test="username"]').fill(user.username)
  await page.locator('[data-test="password"]').fill(user.password)
  await page.locator('[data-test="login-button"]').click()
}

// Assertions only, no clicks: callers continue from the same page state
export async function VerifySuccessfulLogin(page: Page, options?: { timeout?: number }) {
  await expect(page).toHaveURL(/inventory\.html/, options)
  await expect(page.locator('[data-test="inventory-list"]')).toBeVisible(options)
}
