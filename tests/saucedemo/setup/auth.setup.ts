import { test as setup } from "@playwright/test"
import { Login, VerifySuccessfulLogin } from "../page-object-models/login.page"

const standard_user = { username: "standard_user", password: "secret_sauce" }
const authFile = "playwright/.auth/user_saucedemo.json"

setup("authenticate and save session", async ({ page }) => {
  await page.goto("/")
  await Login(page, standard_user)
  await VerifySuccessfulLogin(page)

  await page.context().storageState({ path: authFile })
})