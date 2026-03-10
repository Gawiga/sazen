import { beforeEach, describe, expect, it, vi } from "vitest";
import { SessaoService } from "~/services/sessaoService";
import { UIService } from "~/services/uiService";

vi.mock("~/services/uiService", () => ({
  UIService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("SessaoService (client)", () => {
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

    const result = await SessaoService.getAllPatients();

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

    await SessaoService.getSessions(1, 20);
    await SessaoService.togglePaymentStatus("s1", false);

    expect(UIService.get).toHaveBeenCalledWith(
      "/api/sessoes?page=1&perPage=20&sort=-data",
    );
    expect(UIService.put).toHaveBeenCalledWith("/api/sessoes/s1", {
      pago: true,
    });
  });

  it("payAllPendingByMonth should call bulk payment endpoint", async () => {
    vi.mocked(UIService.post).mockResolvedValueOnce({
      success: true,
      updatedCount: 5,
    });

    const response = await SessaoService.payAllPendingByMonth({
      monthKey: "2026-02",
      ownerId: "owner_1",
      patientId: "pac_1",
      patientName: "Maria",
    });

    expect(UIService.post).toHaveBeenCalledWith("/api/sessoes/pay-all", {
      monthKey: "2026-02",
      ownerId: "owner_1",
      patientId: "pac_1",
      patientName: "Maria",
    });
    expect(response.updatedCount).toBe(5);
  });

  it("getPendingSessionsPreview should call preview endpoint with month/owner/patient scope", async () => {
    vi.mocked(UIService.post).mockResolvedValueOnce({
      success: true,
      items: [
        { id: "s1", id_paciente: "pac_1", data: "2026-02-10", valor: 200 },
      ],
    });

    const response = await SessaoService.getPendingSessionsPreview({
      monthKey: "2026-02",
      ownerId: "owner_1",
      patientId: "pac_1",
    });

    expect(UIService.post).toHaveBeenCalledWith(
      "/api/sessoes/pending-preview",
      {
        monthKey: "2026-02",
        ownerId: "owner_1",
        patientId: "pac_1",
      },
    );
    expect(response.success).toBe(true);
    expect(response.items).toHaveLength(1);
  });

  it("paySingleSession should call pay-single endpoint with loading disabled", async () => {
    vi.mocked(UIService.post).mockResolvedValueOnce({
      success: true,
      updated: true,
    });

    const response = await SessaoService.paySingleSession({
      sessionId: "s1",
      monthKey: "2026-02",
      ownerId: "owner_1",
      patientId: "pac_1",
    });

    expect(UIService.post).toHaveBeenCalledWith(
      "/api/sessoes/pay-single",
      {
        sessionId: "s1",
        monthKey: "2026-02",
        ownerId: "owner_1",
        patientId: "pac_1",
      },
      { showLoading: false },
    );
    expect(response.updated).toBe(true);
  });
});
