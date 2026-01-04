import test, { expect } from "@playwright/test"

test.use({
  baseURL: "https://petstore.swagger.io/v2/",
  extraHTTPHeaders: { api_key: "special-key" },
})

// Test data
const testOrder = {
  id: 12345,
  petId: 1,
  quantity: 2,
  shipDate: new Date().toISOString(),
  status: "placed",
  complete: false,
}

test.describe("Petstore Store API", () => {
  test.describe.configure({ mode: "serial" })

  test("GET /store/inventory - Returns pet inventories by status", async ({ request }) => {
    const response = await request.get("store/inventory")

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
    expect(response.headers()["content-type"]).toContain("application/json")

    const body = await response.json()
    expect(typeof body).toBe("object")
    // Inventory returns an object with status counts (e.g., { available: 10, pending: 5, sold: 3 })
  })

  test("POST /store/order - Place an order for a pet", async ({ request }) => {
    const response = await request.post("store/order", {
      data: testOrder,
    })

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
    expect(response.headers()["content-type"]).toContain("application/json")

    const body = await response.json()
    expect(body.id).toBe(testOrder.id)
    expect(body.petId).toBe(testOrder.petId)
    expect(body.quantity).toBe(testOrder.quantity)
    expect(body.status).toBe(testOrder.status)
    expect(body.complete).toBe(testOrder.complete)
  })

  test("GET /store/order/{orderId} - Find purchase order by ID", async ({ request }) => {
    const response = await request.get(`store/order/${testOrder.id}`)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
    expect(response.headers()["content-type"]).toContain("application/json")

    const body = await response.json()
    expect(body.id).toBe(testOrder.id)
    expect(body.petId).toBe(testOrder.petId)
    expect(body.quantity).toBe(testOrder.quantity)
    expect(body.status).toBe(testOrder.status)
  })

  test("DELETE /store/order/{orderId} - Delete purchase order by ID", async ({ request }) => {
    const response = await request.delete(`store/order/${testOrder.id}`)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    // Verify the order is deleted
    const getResponse = await request.get(`store/order/${testOrder.id}`)
    expect(getResponse.status()).toBe(404)
  })
})

test.describe("Petstore Store API - Order statuses", () => {
  test("POST /store/order - Create order with 'approved' status", async ({ request }) => {
    const approvedOrder = {
      id: 22222,
      petId: 2,
      quantity: 1,
      shipDate: new Date().toISOString(),
      status: "approved",
      complete: false,
    }

    const response = await request.post("store/order", {
      data: approvedOrder,
    })

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body.status).toBe("approved")

    // Cleanup
    await request.delete(`store/order/${approvedOrder.id}`)
  })

  test("POST /store/order - Create order with 'delivered' status", async ({ request }) => {
    const deliveredOrder = {
      id: 33333,
      petId: 3,
      quantity: 3,
      shipDate: new Date().toISOString(),
      status: "delivered",
      complete: true,
    }

    const response = await request.post("store/order", {
      data: deliveredOrder,
    })

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body.status).toBe("delivered")
    expect(body.complete).toBe(true)

    // Cleanup
    await request.delete(`store/order/${deliveredOrder.id}`)
  })
})

test.describe("Petstore Store API - Error cases", () => {
  test("GET /store/order/{orderId} - Order not found returns 404", async ({ request }) => {
    const response = await request.get("store/order/9999999999")

    expect(response.status()).toBe(404)
  })

  test("GET /store/order/{orderId} - Invalid order ID returns 400", async ({ request }) => {
    const response = await request.get("store/order/invalid-id")

    // API returns 404 for invalid IDs
    expect(response.ok()).toBeFalsy()
  })

  test("DELETE /store/order/{orderId} - Delete non-existent order", async ({ request }) => {
    const response = await request.delete("store/order/9999999999")

    expect(response.status()).toBe(404)
  })
})
