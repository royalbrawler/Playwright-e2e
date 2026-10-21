import { test as base, expect } from "@playwright/test"

type Pet = {
  id: number
  name: string
  status: "available" | "pending" | "sold"
  photoUrls: string[]
  category: { id: number; name: string }
  tags: { id: number; name: string }[]
}

// Pick our own ids, below Number.MAX_SAFE_INTEGER: petstore's generated ids are int64 and lose precision in JS
const uniqueId = () => Date.now() * 1000 + Math.floor(Math.random() * 1000)

// Every test gets its own pet, so tests run in any order / in parallel
const test = base.extend<{ newPet: Pet; pet: Pet }>({
  // Unique pet data (not created yet); deleted after the test, even if the test failed
  newPet: async ({ request }, use) => {
    const id = uniqueId()
    await use({
      id,
      name: "Rex",
      status: "available",
      photoUrls: [],
      category: { id: 1, name: "Dogs" },
      tags: [{ id: 1, name: `pw-${id}` }], // unique tag, so findByTags returns only this pet
    })
    await request.delete(`pet/${id}`)
  },
  // The same pet, already created through the API
  pet: async ({ request, newPet }, use) => {
    await expect(await request.post("pet", { data: newPet })).toBeOK()
    await use(newPet)
  },
})

test.describe("Petstore Pet API", () => {
  test("POST /pet - Add a new pet", async ({ request, newPet }) => {
    const response = await request.post("pet", { data: newPet })

    await expect(response).toBeOK()
    expect(await response.json()).toMatchObject(newPet)
  })

  test("GET /pet/{petId} - Find pet by ID", async ({ request, pet }) => {
    const response = await request.get(`pet/${pet.id}`)

    await expect(response).toBeOK()
    expect(response.headers()["content-type"]).toContain("application/json")
    expect(await response.json()).toMatchObject(pet)
  })

  test("PUT /pet - Update an existing pet", async ({ request, pet }) => {
    const updatedPet = { ...pet, name: "Max", status: "sold" }

    const response = await request.put("pet", { data: updatedPet })
    await expect(response).toBeOK()
    expect(await response.json()).toMatchObject(updatedPet)

    // Verify the update was stored
    const getResponse = await request.get(`pet/${pet.id}`)
    expect(await getResponse.json()).toMatchObject(updatedPet)
  })

  test("POST /pet/{petId} - Update a pet with form data", async ({ request, pet }) => {
    const response = await request.post(`pet/${pet.id}`, { form: { name: "Max", status: "sold" } })
    await expect(response).toBeOK()

    const getResponse = await request.get(`pet/${pet.id}`)
    expect(await getResponse.json()).toMatchObject({ name: "Max", status: "sold" })
  })

  test("GET /pet/findByStatus - Finds pets by status", async ({ request, pet }) => {
    const response = await request.get("pet/findByStatus", { params: { status: pet.status } })
    await expect(response).toBeOK()

    const pets: Pet[] = await response.json()
    expect(pets.map((p) => p.id)).toContain(pet.id)
    expect(pets.filter((p) => p.status !== pet.status)).toEqual([])
  })

  test("GET /pet/findByTags - Finds pets by tags (deprecated endpoint)", async ({ request, pet }) => {
    const response = await request.get("pet/findByTags", { params: { tags: pet.tags[0].name } })
    await expect(response).toBeOK()

    const pets: Pet[] = await response.json()
    expect(pets.map((p) => p.id)).toEqual([pet.id])
  })

  test("POST /pet/{petId}/uploadImage - Upload an image", async ({ request, pet }) => {
    const response = await request.post(`pet/${pet.id}/uploadImage`, {
      multipart: {
        additionalMetadata: "uploaded by Playwright",
        file: {
          name: "pet.svg",
          mimeType: "image/svg+xml",
          buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
        },
      },
    })

    await expect(response).toBeOK()
    expect((await response.json()).message).toContain("File uploaded to ./pet.svg")
  })

  test("DELETE /pet/{petId} - Deletes a pet", async ({ request, pet }) => {
    await expect(await request.delete(`pet/${pet.id}`)).toBeOK()

    const getResponse = await request.get(`pet/${pet.id}`)
    expect(getResponse.status()).toBe(404)
  })
})

test.describe("Petstore Pet API - Error cases", () => {
  test("GET /pet/{petId} - Pet not found returns 404", async ({ request }) => {
    const response = await request.get(`pet/${uniqueId()}`)

    expect(response.status()).toBe(404)
    expect(await response.json()).toMatchObject({ type: "error", message: "Pet not found" })
  })

  test("GET /pet/{petId} - Non-numeric ID returns 404 (spec says 400)", async ({ request }) => {
    const response = await request.get("pet/abc")

    expect(response.status()).toBe(404)
  })

  test("POST /pet - Malformed JSON is rejected", async ({ request }) => {
    const response = await request.post("pet", {
      data: "{ not valid json",
      headers: { "Content-Type": "application/json" },
    })

    // Spec says 405; the live demo server has answered both 400 and 500, so only assert "rejected"
    expect(response.status()).toBeGreaterThanOrEqual(400)
  })

  test("DELETE /pet/{petId} - Delete non-existent pet returns 404", async ({ request }) => {
    const response = await request.delete(`pet/${uniqueId()}`)

    expect(response.status()).toBe(404)
  })

  test("GET /pet/findByStatus - Unknown status returns an empty list", async ({ request }) => {
    const response = await request.get("pet/findByStatus", { params: { status: "unknown-status" } })

    await expect(response).toBeOK()
    expect(await response.json()).toEqual([])
  })
})
