import test from "@playwright/test"
import { AddProductToCart } from "../page-object-models/products.page"
import { Login } from "../page-object-models/login.page"
import {
  GoToCartPage,
  AssertProduct,
  GoToSubtotalPage,
  AssertSubtotal,
  CompletePurchase,
  AssertPurchaseComplete,
} from "../page-object-models/cart.page"

// test.use({ launchOptions: { slowMo: 500 } }) // 500ms delay between actions

const deliveryInfo = { firstName: "test", lastName: "test", postalCode: "1234" }
const standard_user_credentials = { username: "standard_user", password: "secret_sauce" }

test.describe(
  "Single item order tests",
  {
    tag: "@cart",
  },
  () => {
    test.use({ colorScheme: "dark" }) // Apply dark mode (for the browser context) for all tests in this describe block
    // Already logged in: the project's storageState comes from setup/auth.setup.ts

    test("Item can be added to cart", async ({ page }) => {
      await page.goto("/inventory.html")

      const addedProduct = await AddProductToCart(page, 0) // Add first product
      await GoToCartPage(page)
      await AssertProduct(page, addedProduct.name!)
    })

    test("Complete workflow for product order", async ({ page }) => {
      await page.goto("/inventory.html")

      const addedProduct = await AddProductToCart(page, 0) // Add first product
      await GoToCartPage(page)
      await AssertProduct(page, addedProduct.name!)
      await GoToSubtotalPage(page, deliveryInfo)
      await AssertSubtotal(page, addedProduct.price)
      await CompletePurchase(page)
      await AssertPurchaseComplete(page)
    })

    // Example: the full journey as steps, starting logged out (the tests above reuse the saved session instead)
    test.describe("Starting logged out", () => {
      test.use({ storageState: { cookies: [], origins: [] } })

      test("Complete workflow for product order - with steps", {tag: '@with-steps'}, async ({ page }) => {
        await page.goto("/")

        await test.step("Login to the application with valid credentials", async () => {
          await Login(page, standard_user_credentials)
        })
        // test.step returns its callback's value
        // { name, value } from AddProductToCart
        const addedProduct = await test.step("Add product to the cart", () => AddProductToCart(page, 0)) // Add first product
        
        await test.step("Verify product is added to the cart", async () => {
          await GoToCartPage(page)
          await AssertProduct(page, addedProduct.name!)
        })
        await test.step("Fill in delivery information and go to subtotal page", async () => {
          await GoToSubtotalPage(page, deliveryInfo)
        })
        await test.step("Verify subtotal is correct", async () => {
          await AssertSubtotal(page, addedProduct.price)
        })
        await test.step("Complete the purchase", async () => {
          await CompletePurchase(page)
        })
        await test.step("Verify purchase is complete", async () => {
          await AssertPurchaseComplete(page)
        })
      })
    })
  }
)
