import { Page, expect } from "@playwright/test"

export async function GoToCartPage(page: Page) {
  const goToCartButton = page.locator('[data-test="shopping-cart-link"]')
  await goToCartButton.click()
}

export async function AssertProduct(page: Page, heading: string) {
  const itemToCheck = page
    //   .locator('[data-test="cart-list"]')
    .locator('[data-test="inventory-item-name"]')
    .filter({ hasText: heading })
  await expect(itemToCheck).toBeVisible()
}

export async function GoToSubtotalPage(
  page: Page,
  deliveryInfo: { firstName: string; lastName: string; postalCode: string }
) {
  const checkoutButton = page.locator('[data-test="checkout"]')
  const firstNameInput = page.locator('[data-test="firstName"]')
  const lastNameInput = page.locator('[data-test="lastName"]')
  const postalCodeInput = page.locator('[data-test="postalCode"]')
  const continueButton = page.locator('[data-test="continue"]')

  await checkoutButton.click()
  await firstNameInput.fill(deliveryInfo.firstName)
  await lastNameInput.fill(deliveryInfo.lastName)
  await postalCodeInput.fill(deliveryInfo.postalCode)
  await continueButton.click()
}

export async function AssertSubtotal(page: Page, expectedSubtotal: number) {
  const subtotalLabel = page.locator('[data-test="subtotal-label"]')
  const subtotalText = await subtotalLabel.textContent()
  const subtotalNumber = parseFloat(subtotalText?.replace(/[^0-9.]/g, "") ?? "0")
  expect(subtotalNumber).toBe(expectedSubtotal)
}

export async function CompletePurchase(page: Page) {
  await page.locator('[data-test="finish"]').click()
}

export async function AssertPurchaseComplete(page: Page) {
  await expect(page.locator('[data-test="pony-express"]')).toBeVisible()
  await expect(page.locator('[data-test="complete-header"]')).toBeVisible()
  await expect(page.locator('[data-test="complete-text"]')).toBeVisible()
}
