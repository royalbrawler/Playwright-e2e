import test, { expect } from "@playwright/test"
import path from "path"

// Resolved from this file, not the cwd: route.fulfill({ path }) resolves relative paths against process.cwd()
const MOCK_IMAGE = path.join(__dirname, "../assets/mock-product.svg")
const MOCK_IMAGE_WIDTH = 400 // width="400" in mock-product.svg; real product photos are 1200

// Already logged in: the project's storageState comes from setup/auth.setup.ts
test.describe("Network interception", () => {
  test("observe: log every request the page makes", async ({ page }) => {
    const requestedUrls: string[] = []
    page.on("request", (request) => {
      requestedUrls.push(request.url())
      console.log(">>", request.method(), request.url())
    })

    await page.goto("/inventory.html")

    // Product images are the last requests; once they show up, the log is complete
    await expect.poll(() => requestedUrls.filter((url) => url.endsWith(".jpg")).length).toBeGreaterThan(0)
  })

  test("intercept: replace product images with a local file", async ({ page }) => {
    const interceptedUrls: string[] = []

    // Only *.jpg: the app's JS/CSS bundles also live in /assets/
    await page.route("**/assets/*.jpg", async (route) => {
      interceptedUrls.push(route.request().url())
      await route.fulfill({ path: MOCK_IMAGE }) // Content-Type is inferred from the .svg extension
    })

    await page.goto("/inventory.html")

    // The handler ran...
    await expect.poll(() => interceptedUrls.length).toBeGreaterThan(0)
    // ...and the page actually rendered our file
    await expect(page.getByAltText("Sauce Labs Backpack")).toHaveJSProperty("naturalWidth", MOCK_IMAGE_WIDTH)
    console.log("Intercepted URLs:", interceptedUrls)
  })
})
