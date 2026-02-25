import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { UIService, scrollToElement } from "~/services/uiService";

describe("UIService", () => {
  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });

    // Mock fetch
    global.fetch = vi.fn();
    // Mock loading functions
    window.showLoading = vi.fn();
    window.hideLoading = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("GET method", () => {
    it("should return parsed JSON on successful GET", async () => {
      const testData = { message: "success", data: [1, 2, 3] };
      const mockResponse = new Response(JSON.stringify(testData), {
        status: 200,
      });
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      const result = await UIService.get("/api/test");

      expect(result).toEqual(testData);
      expect(global.fetch).toHaveBeenCalled();
    });

    it("should show and hide loading on GET request", async () => {
      const mockResponse = new Response(JSON.stringify({}), { status: 200 });
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      await UIService.get("/api/test");

      expect(window.showLoading).toHaveBeenCalled();
      expect(window.hideLoading).toHaveBeenCalled();
    });

    it("should throw error on non-2xx status", async () => {
      const mockResponse = new Response("Not Found", { status: 404 });
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      await expect(UIService.get("/api/missing")).rejects.toThrow("HTTP 404");
    });

    it("should respect showLoading=false option", async () => {
      const mockResponse = new Response(JSON.stringify({}), { status: 200 });
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      await UIService.get("/api/test", { showLoading: false });

      expect(window.showLoading).not.toHaveBeenCalled();
      expect(window.hideLoading).not.toHaveBeenCalled();
    });
  });

  describe("POST method", () => {
    it("should send JSON body on POST", async () => {
      const testData = { name: "John", email: "john@example.com" };
      const mockResponse = new Response(
        JSON.stringify({ id: 1, ...testData }),
        { status: 201 },
      );
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      const result = await UIService.post("/api/usuarios", testData);

      expect(result).toEqual({ id: 1, ...testData });
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/usuarios",
        expect.objectContaining({
          method: "POST",
        }),
      );
    });

    it("should show loading during POST request", async () => {
      const mockResponse = new Response(JSON.stringify({}), { status: 201 });
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      await UIService.post("/api/test", { name: "test" });

      expect(window.showLoading).toHaveBeenCalled();
      expect(window.hideLoading).toHaveBeenCalled();
    });

    it("should throw error on POST failure", async () => {
      const mockResponse = new Response("Bad Request", { status: 400 });
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      await expect(UIService.post("/api/test", {})).rejects.toThrow("HTTP 400");
    });
  });

  describe("PUT method", () => {
    it("should send JSON body on PUT", async () => {
      const testData = { name: "Jane" };
      const mockResponse = new Response(
        JSON.stringify({ id: 1, ...testData }),
        { status: 200 },
      );
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      const result = await UIService.put("/api/usuarios/1", testData);

      expect(result).toEqual({ id: 1, ...testData });
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/usuarios/1",
        expect.objectContaining({
          method: "PUT",
        }),
      );
    });

    it("should throw error on PUT failure", async () => {
      const mockResponse = new Response("Conflict", { status: 409 });
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      await expect(UIService.put("/api/test/1", {})).rejects.toThrow(
        "HTTP 409",
      );
    });
  });

  describe("DELETE method", () => {
    it("should call DELETE endpoint", async () => {
      const mockResponse = new Response(null, { status: 204 });
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      const result = await UIService.delete("/api/usuarios/1");

      expect(result).toBeNull();
      expect(global.fetch).toHaveBeenCalled();
    });

    it("should return JSON on DELETE with 200 status", async () => {
      const mockResponse = new Response(JSON.stringify({ success: true }), {
        status: 200,
      });
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      const result = await UIService.delete("/api/usuarios/1");

      expect(result).toEqual({ success: true });
    });

    it("should throw error on DELETE failure", async () => {
      const mockResponse = new Response("Server Error", { status: 500 });
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      await expect(UIService.delete("/api/test/1")).rejects.toThrow("HTTP 500");
    });
  });

  describe("scrollToElement", () => {
    it("should call scrollIntoView on existing element", () => {
      const mockElement = {
        scrollIntoView: vi.fn(),
      };
      vi.spyOn(document, "getElementById").mockReturnValue(
        mockElement as unknown as HTMLElement,
      );

      scrollToElement("test-element");

      expect(document.getElementById).toHaveBeenCalledWith("test-element");
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith(
        expect.objectContaining({
          behavior: "smooth",
          block: "start",
        }),
      );
    });

    it("should not throw when element does not exist", () => {
      vi.spyOn(document, "getElementById").mockReturnValue(null);

      expect(() => scrollToElement("non-existent")).not.toThrow();
    });

    it("should accept custom scroll options", () => {
      const mockElement = {
        scrollIntoView: vi.fn(),
      };
      vi.spyOn(document, "getElementById").mockReturnValue(
        mockElement as unknown as HTMLElement,
      );

      scrollToElement("test-element", { block: "center" });

      expect(mockElement.scrollIntoView).toHaveBeenCalledWith(
        expect.objectContaining({
          behavior: "smooth",
          block: "center",
        }),
      );
    });
  });

  describe("Error handling", () => {
    it("should handle fetch network errors", async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"));

      await expect(UIService.get("/api/test")).rejects.toThrow();
    });

    it("should handle invalid JSON responses", async () => {
      const mockResponse = new Response("invalid json", { status: 200 });
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      await expect(UIService.get("/api/test")).rejects.toThrow();
    });

    it("should hide loading even when error occurs", async () => {
      const mockResponse = new Response("Error", { status: 500 });
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      try {
        await UIService.get("/api/test");
      } catch {
        // Expected
      }

      expect(window.hideLoading).toHaveBeenCalled();
    });
  });
});
