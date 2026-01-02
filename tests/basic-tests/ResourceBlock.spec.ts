import { test as base, expect, Page, BrowserContext, chromium } from "@playwright/test"
import * as loginPage from "../page-object-models/Login"

const standard_user_credentials = { username: "standard_user", password: "secret_sauce" }

// Custom test fixture that closes and reopens browser before each test
const test = base.extend<{ page: Page; context: BrowserContext }>({
  context: async ({}, use) => {
    const browser = await chromium.launch()
    const context = await browser.newContext()
    await use(context)
    await context.close()
    await browser.close()
  },
  page: async ({ context }, use) => {
    const page = await context.newPage()
    await use(page)
  },
})

test("Resource (*image) block test example", async ({ page }) => {
  await page.route("**/*", (route) => {
    if (route.request().resourceType() === "image") {
      return route.abort()
    } else {
      route.continue()
    }
  })

  await page.goto("/")
  await loginPage.Login(page, standard_user_credentials)
  await loginPage.VerifySuccessfulLogin(page)
  await page.waitForLoadState("networkidle")

  await test.step("Assert all images are broken", async () => {
    const images = page.locator(".inventory_item_img img")
    const count = await images.count()

    for (let i = 0; i < count; i++) {
      await expect(images.nth(i)).toHaveJSProperty("naturalWidth", 0)
    }
  })
})
