import { test, expect } from "@playwright/test";

// Ensure the dev server is running at BASE_URL (default http://localhost:4322)

test.describe("Auth & API", () => {
  test("GET /api/lambda returns JSON 200", async ({ request, baseURL }) => {
    const url = `${baseURL}/api/lambda`;
    const res = await request.get(url);
    expect(res.status()).toBe(200);
    const ct = res.headers()["content-type"] || "";
    expect(ct).toContain("application/json");
    const body = await res.json().catch(() => null);
    expect(body).not.toBeNull();
  });

  test("GET /api/auth/user without cookie returns 401 JSON", async ({
    request,
    baseURL,
  }) => {
    const url = `${baseURL}/api/auth/user`;
    const res = await request.get(url);
    expect(res.status()).toBe(401);
    const body = await res.json().catch(() => null);
    expect(body).toBeTruthy();
    expect(typeof body).toBe("object");
  });
});
