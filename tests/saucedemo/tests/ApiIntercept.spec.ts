import test, { expect, Page } from "@playwright/test"
import { Login, VerifySuccessfulLogin } from "../page-object-models/Login"

let page: Page

test.beforeEach(async ({ browser }) => {
  const context = await browser.newContext()
  page = await context.newPage()
})

test.afterEach(async () => {
  await page.close()
})

test("API intercept - print calls", async () => {
  page.on("request", (request) => console.log(">>", request.method(), request.url()))

  await page.goto("/")
  await Login(page, { username: "standard_user", password: "secret_sauce" })
  await VerifySuccessfulLogin(page)

  await page.waitForLoadState("networkidle")
})

test("API intercept - modify images", async () => {
  const interceptedUrls: string[] = []

  // Fetch the SVG once before setting up the route handler
  const svgBuffer = Buffer.from(
    await (await fetch("https://www.saucedemo.com/static/media/arrow3x.4b825b78b4bd5f987b7d.svg")).arrayBuffer()
  )

  // Intercept all requests to the media folder and replace with the arrow SVG
  await page.route("https://www.saucedemo.com/static/media/**", async (route) => {
    interceptedUrls.push(route.request().url())
    await route.fulfill({
      status: 200,
      contentType: "image/svg+xml",
      body: svgBuffer,
    })
  })

  await page.goto("/")
  await Login(page, { username: "standard_user", password: "secret_sauce" })
  await VerifySuccessfulLogin(page)

  await page.waitForLoadState("networkidle")

  // Verify images were intercepted
  console.log("Intercepted URLs:", interceptedUrls)
  expect(interceptedUrls.length).toBeGreaterThan(0)
})
