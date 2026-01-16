import test, { expect, Page } from "@playwright/test"

// test.use({ launchOptions: { slowMo: 500 } }) // 500ms delay between actions

const deliveryInfo = { firstName: "test", lastName: "test", postalCode: "1234" }
const standard_user = { username: "standard_user", password: "secret_sauce" }

async function Login(page: Page, username: string, password: string) {
  await page.locator('[data-test="username"]').fill(username)
  await page.locator('[data-test="password"]').fill(password)
  await page.locator('[data-test="login-button"]').click()
}

test("Item can be added to cart", async ({ page }) => {
  // Arrange
  const goToCartButton = page.locator('[data-test="shopping-cart-link"]')
  const cartList = page.locator('[data-test="cart-list"]')
  const item_1 = page.locator('[data-test="inventory-item"]').first()
  const item_1_nameLocator = item_1.locator('[data-test="inventory-item-name"]')
  const item_1_addToCartButton = item_1.getByRole("button")
  const item_1_priceLocator = item_1.locator(".inventory_item_price")
  const checkoutButton = page.locator('[data-test="checkout"]')
  const firstNameInput = page.locator('[data-test="firstName"]')
  const lastNameInput = page.locator('[data-test="lastName"]')
  const postalCodeInput = page.locator('[data-test="postalCode"]')
  const continueButton = page.locator('[data-test="continue"]')
  const subtotalLabel = page.locator('[data-test="subtotal-label"]')

  await page.goto("/")
  await Login(page, standard_user.username, standard_user.password)

  const item_1_heading = await item_1_nameLocator.textContent()
  const item_1_price = await item_1_priceLocator.textContent()
  const item_1_priceNumber = parseFloat(item_1_price?.replace(/[^0-9.]/g, "") ?? "0")

  // Act
  await item_1_addToCartButton.click()
  await goToCartButton.click()
  await checkoutButton.click()
  await firstNameInput.fill(deliveryInfo.firstName)
  await lastNameInput.fill(deliveryInfo.lastName)
  await postalCodeInput.fill(deliveryInfo.postalCode)
  await continueButton.click()

  // Assert
  const itemToCheck = cartList.getByText(item_1_heading!)
  const subtotalText = await subtotalLabel.textContent()
  const subtotalNumber = parseFloat(subtotalText?.replace(/[^0-9.]/g, "") ?? "0")

  await expect(itemToCheck).toBeVisible()
  expect(subtotalNumber).toBe(item_1_priceNumber)
})
