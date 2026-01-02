import { test, expect, Page } from "@playwright/test"
import * as loginPage from "../page-object-models/Login"

const standard_user_credentials = { username: "standard_user", password: "secret_sauce" }

let page: Page

test.beforeEach(async ({ browser }) => {
  const context = await browser.newContext()
  page = await context.newPage()
})

test.afterEach(async () => {
  await page.close()
})

test("Resource (*image) block test example", async () => {
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
