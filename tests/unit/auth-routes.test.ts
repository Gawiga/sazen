import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAuthWithPassword = vi.fn();
const mockAuthRefresh = vi.fn();
const mockAuthStoreSave = vi.fn();

const mockAuthStore = {
  token: "mock-token",
  record: {
    id: "u1",
    email: "gawiga@gmail.com",
    name: "Gawiga",
    username: "gawiga",
  },
  save: mockAuthStoreSave,
};

vi.mock("pocketbase", () => {
  const PocketBaseMock = vi.fn(function PocketBaseMock() {
    return {
      collection: () => ({
        authWithPassword: mockAuthWithPassword,
        authRefresh: mockAuthRefresh,
      }),
      authStore: mockAuthStore,
    };
  });

  return { default: PocketBaseMock };
});

import { POST as loginPost } from "~/pages/api/auth/login";
import { POST as refreshPost } from "~/pages/api/auth/refresh";
import { GET as userGet } from "~/pages/api/auth/user";

interface CookieStoreMock {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
}

function createCookies(token?: string): CookieStoreMock {
  return {
    get: vi.fn((name: string) =>
      name === "pb_auth" && token ? { value: token } : undefined,
    ),
    set: vi.fn(),
    delete: vi.fn(),
  };
}

describe("Auth API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStore.token = "mock-token";
    mockAuthStore.record = {
      id: "u1",
      email: "gawiga@gmail.com",
      name: "Gawiga",
      username: "gawiga",
    };
    mockAuthWithPassword.mockResolvedValue({
      token: "mock-token",
      record: mockAuthStore.record,
    });
    mockAuthRefresh.mockResolvedValue({
      token: "refreshed-token",
      record: mockAuthStore.record,
    });
  });

  describe("/api/auth/login", () => {
    it("returns 400 for invalid JSON payload", async () => {
      const request = new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: "{invalid",
        headers: { "Content-Type": "application/json" },
      });
      const cookies = createCookies();

      const response = await loginPost({ request, cookies } as never);
      expect(response.status).toBe(400);
      expect(mockAuthWithPassword).not.toHaveBeenCalled();
    });

    it("authenticates with normalized email and sets cookie", async () => {
      const request = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "  GAWIGA@GMAIL.COM  ",
          password: "teste123",
        }),
      });
      const cookies = createCookies();

      const response = await loginPost({ request, cookies } as never);
      expect(response.status).toBe(200);
      expect(mockAuthWithPassword).toHaveBeenCalledWith(
        "gawiga@gmail.com",
        "teste123",
      );
      expect(cookies.set).toHaveBeenCalled();
    });
  });

  describe("/api/auth/user", () => {
    it("returns 401 when token is missing", async () => {
      const request = new Request("http://localhost/api/auth/user");
      const cookies = createCookies();

      const response = await userGet({ request, cookies } as never);
      expect(response.status).toBe(401);
      expect(mockAuthRefresh).not.toHaveBeenCalled();
    });

    it("validates token via PocketBase and returns user data", async () => {
      const request = new Request("http://localhost/api/auth/user", {
        headers: { Authorization: "Bearer valid-token" },
      });
      const cookies = createCookies();

      const response = await userGet({ request, cookies } as never);
      expect(response.status).toBe(200);
      expect(mockAuthStoreSave).toHaveBeenCalledWith("valid-token");
      expect(mockAuthRefresh).toHaveBeenCalled();
      expect(cookies.set).toHaveBeenCalled();

      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.user.name).toBe("Gawiga");
    });
  });

  describe("/api/auth/refresh", () => {
    it("returns 401 without auth cookie", async () => {
      const cookies = createCookies();
      const response = await refreshPost({ cookies } as never);

      expect(response.status).toBe(401);
      expect(mockAuthRefresh).not.toHaveBeenCalled();
    });

    it("uses authRefresh and updates cookie for valid token", async () => {
      mockAuthStore.token = "new-token-from-pb";
      const cookies = createCookies("valid-cookie-token");

      const response = await refreshPost({ cookies } as never);
      expect(response.status).toBe(200);
      expect(mockAuthStoreSave).toHaveBeenCalledWith("valid-cookie-token");
      expect(mockAuthRefresh).toHaveBeenCalled();
      expect(cookies.set).toHaveBeenCalled();
    });
  });
});
