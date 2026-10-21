import { test, expect } from "@playwright/test"

// Already logged in: the project's storageState comes from setup/auth.setup.ts
test("Resource (*image) block test example", async ({ page }) => {
  await page.route("**/*", (route) =>
    route.request().resourceType() === "image" ? route.abort() : route.continue()
  )

  await page.goto("/inventory.html")

  await test.step("Assert all images are broken", async () => {
    const images = page.locator(".inventory_item_img img")
    await expect(images).toHaveCount(6) // guards the loop below against passing on zero images

    for (const image of await images.all()) {
      // complete + naturalWidth 0 = load failed; a still-loading image also has naturalWidth 0
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth === 0)).toBe(true)
    }
  })
})
