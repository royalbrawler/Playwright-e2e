import { type Page } from "@playwright/test"

export async function AddProductToCart(page: Page, productIndex: number) {
  const product = page.locator('[data-test="inventory-item"]').nth(productIndex)
  const productName = await product.locator('[data-test="inventory-item-name"]').textContent()
  const item_price = await product.locator(".inventory_item_price").textContent()
  const priceNumber = parseFloat(item_price?.replace(/[^0-9.]/g, "") ?? "0")

  const addToCartButton = product.getByRole("button")
  await addToCartButton.click()

  return { name: productName, price: priceNumber }
}
