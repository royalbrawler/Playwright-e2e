import test, { expect } from "@playwright/test"

// Example: per-file options with test.use. It REPLACES the project's extraHTTPHeaders (no merge),
// so Accept from playwright.config.ts must be repeated here, or it is silently dropped for this file
test.use({
  extraHTTPHeaders: { Accept: "application/json", api_key: "special-key" },
})

// Unique per run (below Number.MAX_SAFE_INTEGER), so parallel/repeated runs never collide on the shared demo server
const uniqueId = () => Date.now() * 1000 + Math.floor(Math.random() * 1000)

// Test data
const testOrder = {
  id: uniqueId(),
  petId: 1,
  quantity: 2,
  shipDate: new Date().toISOString(),
  status: "placed",
  complete: false,
}
// The server reformats shipDate ("...Z" -> "...+0000"): match any string here, compare it as a timestamp in the tests
const expectedOrder = { ...testOrder, shipDate: expect.any(String) }

// Example: serial mode - one order goes create -> read -> delete, one test per step
test.describe("Petstore Store API", () => {
  test.describe.configure({ mode: "serial" })

  // Runs even if a test in the chain failed, so the order never leaks
  test.afterAll(async ({ request }) => {
    await request.delete(`store/order/${testOrder.id}`)
  })

  test("GET /store/inventory - Returns pet inventories by status", async ({ request }) => {
    const response = await request.get("store/inventory")

    await expect(response).toBeOK()
    expect(response.headers()["content-type"]).toContain("application/json")

    // Keys are whatever statuses users created on the demo server ("available", "sold", "Sold", ...); values are counts
    const body: Record<string, unknown> = await response.json()
    expect(Object.values(body).filter((count) => typeof count !== "number")).toEqual([])
  })

  test("POST /store/order - Place an order for a pet", async ({ request }) => {
    const response = await request.post("store/order", { data: testOrder })

    await expect(response).toBeOK()
    expect(response.headers()["content-type"]).toContain("application/json")
    const body = await response.json()
    expect(body).toMatchObject(expectedOrder)
    // Same moment in time, even though the server writes "+0000" instead of "Z"
    expect(new Date(body.shipDate).getTime()).toBe(new Date(testOrder.shipDate).getTime())
  })

  test("GET /store/order/{orderId} - Find purchase order by ID", async ({ request }) => {
    const response = await request.get(`store/order/${testOrder.id}`)

    await expect(response).toBeOK()
    expect(response.headers()["content-type"]).toContain("application/json")
    const body = await response.json()
    expect(body).toMatchObject(expectedOrder)
    // Same moment in time, even though the server writes "+0000" instead of "Z"
    expect(new Date(body.shipDate).getTime()).toBe(new Date(testOrder.shipDate).getTime())
  })

  test("DELETE /store/order/{orderId} - Delete purchase order by ID", async ({ request }) => {
    const response = await request.delete(`store/order/${testOrder.id}`)
    await expect(response).toBeOK()

    // Verify the order is deleted
    const getResponse = await request.get(`store/order/${testOrder.id}`)
    expect(getResponse.status()).toBe(404)
  })
})

test.describe("Petstore Store API - Order statuses", () => {
  test("POST /store/order - Create order with 'approved' status", async ({ request }) => {
    const approvedOrder = {
      id: uniqueId(),
      petId: 2,
      quantity: 1,
      shipDate: new Date().toISOString(),
      status: "approved",
      complete: false,
    }

    const response = await request.post("store/order", {
      data: approvedOrder,
    })

    await expect(response).toBeOK()
    expect(await response.json()).toMatchObject({ status: "approved" })

    // Cleanup
    await request.delete(`store/order/${approvedOrder.id}`)
  })

  test("POST /store/order - Create order with 'delivered' status", async ({ request }) => {
    const deliveredOrder = {
      id: uniqueId(),
      petId: 3,
      quantity: 3,
      shipDate: new Date().toISOString(),
      status: "delivered",
      complete: true,
    }

    const response = await request.post("store/order", {
      data: deliveredOrder,
    })

    await expect(response).toBeOK()
    expect(await response.json()).toMatchObject({ status: "delivered", complete: true })

    // Cleanup
    await request.delete(`store/order/${deliveredOrder.id}`)
  })
})

test.describe("Petstore Store API - Error cases", () => {
  test("GET /store/order/{orderId} - Order not found returns 404", async ({ request }) => {
    const response = await request.get(`store/order/${uniqueId()}`)

    expect(response.status()).toBe(404)
  })

  test("GET /store/order/{orderId} - Non-numeric ID returns 404 (spec says 400)", async ({ request }) => {
    const response = await request.get("store/order/invalid-id")

    expect(response.status()).toBe(404)
  })

  test("DELETE /store/order/{orderId} - Delete non-existent order returns 404", async ({ request }) => {
    const response = await request.delete(`store/order/${uniqueId()}`)

    expect(response.status()).toBe(404)
  })
})
