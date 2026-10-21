import test, { expect } from "@playwright/test"

// Unique per run (below Number.MAX_SAFE_INTEGER), so parallel/repeated runs never collide on the shared demo server
const uniqueId = () => Date.now() * 1000 + Math.floor(Math.random() * 1000)
const runId = uniqueId()

// Test data
const testUser = {
  id: runId,
  username: `testuser_playwright_${runId}`,
  firstName: "John",
  lastName: "Smith",
  email: "john.smith@example.com",
  password: "SecureParola123!",
  phone: "123-123-1234",
  userStatus: 1,
}

const updatedUser = {
  ...testUser,
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.com",
}

// Example: serial mode - one user goes create -> read -> login/logout -> update -> delete, one test per step
test.describe("Petstore User API", () => {
  test.describe.configure({ mode: "serial" })

  // Runs even if a test in the chain failed, so the user never leaks
  test.afterAll(async ({ request }) => {
    await request.delete(`user/${testUser.username}`)
  })

  test("POST /user - Create a single user", async ({ request }) => {
    const response = await request.post("user", {
      data: testUser,
    })

    await expect(response).toBeOK()
    expect(response.headers()["content-type"]).toContain("application/json")
    const body = await response.json()

    // Example: the same check written 3 ways
    // 1. toBe - one value at a time
    expect(body.message).toBe(String(testUser.id))
    expect(body.code).toBe(200)
    // 2. toHaveProperty - key + value; the failure message says if the key is missing
    expect(body).toHaveProperty("message", testUser.id.toString())
    expect(body).toHaveProperty("code", 200)
    // 3. toMatchObject - several fields at once, extra fields in the response are ignored
    expect(body).toMatchObject({ code: 200, message: String(testUser.id) })
  })

  test("GET /user/{username} - Get user by username", async ({ request }) => {
    const response = await request.get(`user/${testUser.username}`)

    // Example: the long way - status and each field checked one by one.
    // The other tests do the same with: await expect(response).toBeOK() + toMatchObject(testUser)
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.username).toBe(testUser.username)
    expect(body.firstName).toBe(testUser.firstName)
    expect(body.lastName).toBe(testUser.lastName)
    expect(body.email).toBe(testUser.email)
    expect(body.phone).toBe(testUser.phone)
  })

  test("GET /user/login - Login user", async ({ request }) => {
    const response = await request.get("user/login", {
      params: {
        username: testUser.username,
        password: testUser.password,
      },
    })

    await expect(response).toBeOK()
    expect((await response.json()).message).toContain("logged in user session")
  })

  test("GET /user/logout - Logout user", async ({ request }) => {
    const response = await request.get("user/logout")

    await expect(response).toBeOK()
    expect(await response.json()).toMatchObject({ message: "ok" })
  })

  test("PUT /user/{username} - Update user", async ({ request }) => {
    const response = await request.put(`user/${testUser.username}`, {
      data: updatedUser,
    })
    await expect(response).toBeOK()

    // Verify the update
    const getResponse = await request.get(`user/${testUser.username}`)
    await expect(getResponse).toBeOK()
    expect(await getResponse.json()).toMatchObject(updatedUser)
  })

  test("DELETE /user/{username} - Delete user", async ({ request }) => {
    const response = await request.delete(`user/${testUser.username}`)
    await expect(response).toBeOK()

    // Verify the user is deleted
    const getResponse = await request.get(`user/${testUser.username}`)
    expect(getResponse.status()).toBe(404)
  })

  test("POST /user/createWithList - Create users with list", async ({ request }) => {
    const users = [
      {
        id: uniqueId(),
        username: `listuser1_${runId}`,
        firstName: "List",
        lastName: "UserOne",
        email: "listuser1@example.com",
        password: "Password123!",
        phone: "555-111-1111",
        userStatus: 1,
      },
      {
        id: uniqueId(),
        username: `listuser2_${runId}`,
        firstName: "List",
        lastName: "UserTwo",
        email: "listuser2@example.com",
        password: "Password123!",
        phone: "555-222-2222",
        userStatus: 1,
      },
    ]

    const response = await request.post("user/createWithList", {
      data: users,
    })
    await expect(response).toBeOK()

    // Verify users were created
    for (const user of users) {
      const getResponse = await request.get(`user/${user.username}`)
      await expect(getResponse).toBeOK()
      expect(await getResponse.json()).toMatchObject(user)
    }

    // Cleanup: delete created users
    for (const user of users) {
      await request.delete(`user/${user.username}`)
    }
  })

  test("POST /user/createWithArray - Create users with array", async ({ request }) => {
    const users = [
      {
        id: uniqueId(),
        username: `arrayuser1_${runId}`,
        firstName: "Array",
        lastName: "UserOne",
        email: "arrayuser1@example.com",
        password: "Password123!",
        phone: "555-333-3333",
        userStatus: 1,
      },
      {
        id: uniqueId(),
        username: `arrayuser2_${runId}`,
        firstName: "Array",
        lastName: "UserTwo",
        email: "arrayuser2@example.com",
        password: "Password123!",
        phone: "555-444-4444",
        userStatus: 1,
      },
    ]

    const response = await request.post("user/createWithArray", {
      data: users,
    })
    await expect(response).toBeOK()

    // Verify users were created
    for (const user of users) {
      const getResponse = await request.get(`user/${user.username}`)
      await expect(getResponse).toBeOK()
      expect(await getResponse.json()).toMatchObject(user)
    }

    // Cleanup: delete created users
    for (const user of users) {
      await request.delete(`user/${user.username}`)
    }
  })
})

test.describe("Petstore User API - Error cases", () => {
  test("GET /user/{username} - User not found returns 404", async ({ request }) => {
    const response = await request.get(`user/nonexistent_${runId}`)

    expect(response.status()).toBe(404)
  })

  test("GET /user/login - Accepts any credentials (demo server quirk)", async ({ request }) => {
    const response = await request.get("user/login", {
      params: {
        username: `invaliduser_${runId}`,
        password: "wrongpassword",
      },
    })

    // A real API should reject this with 400; the demo server logs anyone in
    await expect(response).toBeOK()
  })
})
