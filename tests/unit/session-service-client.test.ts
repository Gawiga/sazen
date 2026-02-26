import { beforeEach, describe, expect, it, vi } from "vitest";
import { SessionService } from "~/services/sessionService";
import { UIService } from "~/services/uiService";

vi.mock("~/services/uiService", () => ({
  UIService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("SessionService (client)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAllPatients should paginate all pages and sort by name", async () => {
    vi.mocked(UIService.get)
      .mockResolvedValueOnce({
        page: 1,
        perPage: 100,
        totalPages: 2,
        totalItems: 3,
        items: [
          { id: "2", nome: "Bruno" },
          { id: "1", nome: "Carlos" },
        ],
      })
      .mockResolvedValueOnce({
        page: 2,
        perPage: 100,
        totalPages: 2,
        totalItems: 3,
        items: [{ id: "3", nome: "Ana" }],
      });

    const result = await SessionService.getAllPatients();

    expect(UIService.get).toHaveBeenNthCalledWith(
      1,
      "/api/pacientes?page=1&perPage=100&status=todos",
      {
        showLoading: true,
      },
    );
    expect(UIService.get).toHaveBeenNthCalledWith(
      2,
      "/api/pacientes?page=2&perPage=100&status=todos",
      {
        showLoading: false,
      },
    );
    expect(result.map((p) => p.nome)).toEqual(["Ana", "Bruno", "Carlos"]);
  });

  it("getSessions and togglePaymentStatus should call expected endpoints", async () => {
    vi.mocked(UIService.get).mockResolvedValueOnce({
      page: 1,
      perPage: 20,
      totalPages: 1,
      totalItems: 0,
      items: [],
    });
    vi.mocked(UIService.put).mockResolvedValueOnce({ id: "s1", pago: true });

    await SessionService.getSessions(1, 20);
    await SessionService.togglePaymentStatus("s1", false);

    expect(UIService.get).toHaveBeenCalledWith(
      "/api/sessoes?page=1&perPage=20&sort=-data",
    );
    expect(UIService.put).toHaveBeenCalledWith("/api/sessoes/s1", {
      pago: true,
    });
  });
});
