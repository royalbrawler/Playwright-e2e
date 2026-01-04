import test, { expect } from "@playwright/test"

test.use({
  baseURL: "https://petstore.swagger.io/v2/",
})

// Test data
const testUser = {
  id: 12345,
  username: "testuser_playwright",
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

test.describe("Petstore User API", () => {
  test.describe.configure({ mode: "serial" })

  test("POST /user - Create a single user", async ({ request }) => {
    const response = await request.post("user", {
      data: testUser,
    })

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
    expect(response.headers()["content-type"]).toContain("application/json")
    const body = await response.json()
    expect(body.message).toBe(String(testUser.id))
    expect(body).toHaveProperty("message", testUser.id.toString())
    expect(body).toHaveProperty("code", 200)
    expect(body.code).toBe(200)
  })

  test("GET /user/{username} - Get user by username", async ({ request }) => {
    const response = await request.get(`user/${testUser.username}`)

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

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.message).toContain("logged in user session")
  })

  test("GET /user/logout - Logout user", async ({ request }) => {
    const response = await request.get("user/logout")

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.message).toBe("ok")
  })

  test("PUT /user/{username} - Update user", async ({ request }) => {
    const response = await request.put(`user/${testUser.username}`, {
      data: updatedUser,
    })

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    // Verify the update
    const getResponse = await request.get(`user/${testUser.username}`)
    expect(getResponse.ok()).toBeTruthy()
    const body = await getResponse.json()
    expect(body.firstName).toBe(updatedUser.firstName)
    expect(body.lastName).toBe(updatedUser.lastName)
    expect(body.email).toBe(updatedUser.email)
  })

  test("DELETE /user/{username} - Delete user", async ({ request }) => {
    const response = await request.delete(`user/${testUser.username}`)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    // Verify the user is deleted
    const getResponse = await request.get(`user/${testUser.username}`)
    expect(getResponse.status()).toBe(404)
  })

  test("POST /user/createWithList - Create users with list", async ({ request }) => {
    const users = [
      {
        id: 11111,
        username: "listuser1",
        firstName: "List",
        lastName: "UserOne",
        email: "listuser1@example.com",
        password: "Password123!",
        phone: "555-111-1111",
        userStatus: 1,
      },
      {
        id: 22222,
        username: "listuser2",
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

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    // Verify users were created
    for (const user of users) {
      const getResponse = await request.get(`user/${user.username}`)
      expect(getResponse.ok()).toBeTruthy()
      expect(getResponse.status()).toBe(200)
      const body = await getResponse.json()
      expect(body.username).toBe(user.username)
    }

    // Cleanup: delete created users
    for (const user of users) {
      await request.delete(`user/${user.username}`)
    }
  })

  test("POST /user/createWithArray - Create users with array", async ({ request }) => {
    const users = [
      {
        id: 33333,
        username: "arrayuser1",
        firstName: "Array",
        lastName: "UserOne",
        email: "arrayuser1@example.com",
        password: "Password123!",
        phone: "555-333-3333",
        userStatus: 1,
      },
      {
        id: 44444,
        username: "arrayuser2",
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

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    // Verify users were created
    for (const user of users) {
      const getResponse = await request.get(`user/${user.username}`)
      expect(getResponse.ok()).toBeTruthy()
      expect(getResponse.status()).toBe(200)
      const body = await getResponse.json()
      expect(body.username).toBe(user.username)
    }

    // Cleanup: delete created users
    for (const user of users) {
      await request.delete(`user/${user.username}`)
    }
  })
})

test.describe("Petstore User API - Error cases", () => {
  test("GET /user/{username} - User not found returns 404", async ({ request }) => {
    const response = await request.get("user/nonexistentuser12345")

    expect(response.status()).toBe(404)
  })

  test("GET /user/login - Invalid credentials", async ({ request }) => {
    const response = await request.get("user/login", {
      params: {
        username: "invaliduser",
        password: "wrongpassword",
      },
    })

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
  })
})
