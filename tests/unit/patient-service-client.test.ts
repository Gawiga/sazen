import { beforeEach, describe, expect, it, vi } from "vitest";
import { PacienteService } from "~/services/pacienteService";
import { UIService } from "~/services/uiService";

vi.mock("~/services/uiService", () => ({
  UIService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("PacienteService (client)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getPatients should call API with page/perPage and default active status", async () => {
    vi.mocked(UIService.get).mockResolvedValueOnce({
      page: 1,
      perPage: 20,
      totalPages: 1,
      totalItems: 0,
      items: [],
    });

    await PacienteService.getPatients(1, 20);

    expect(UIService.get).toHaveBeenCalledWith(
      "/api/pacientes?page=1&perPage=20&status=ativo",
    );
  });

  it("getPatients should allow custom status filter", async () => {
    vi.mocked(UIService.get).mockResolvedValueOnce({
      page: 1,
      perPage: 20,
      totalPages: 1,
      totalItems: 0,
      items: [],
    });

    await PacienteService.getPatients(1, 20, "todos");

    expect(UIService.get).toHaveBeenCalledWith(
      "/api/pacientes?page=1&perPage=20&status=todos",
    );
  });

  it("create/update/delete/get by id should call expected endpoints", async () => {
    vi.mocked(UIService.post).mockResolvedValueOnce({ id: "p1", nome: "Ana" });
    vi.mocked(UIService.put).mockResolvedValueOnce({ id: "p1", nome: "Ana 2" });
    vi.mocked(UIService.delete).mockResolvedValueOnce(undefined);
    vi.mocked(UIService.get).mockResolvedValueOnce({ id: "p1", nome: "Ana 2" });

    await PacienteService.createPatient({ nome: "Ana" });
    await PacienteService.updatePatient("p1", { nome: "Ana 2" });
    await PacienteService.deletePatient("p1");
    await PacienteService.getPatient("p1");

    expect(UIService.post).toHaveBeenCalledWith("/api/pacientes", {
      nome: "Ana",
    });
    expect(UIService.put).toHaveBeenCalledWith("/api/pacientes/p1", {
      nome: "Ana 2",
    });
    expect(UIService.delete).toHaveBeenCalledWith("/api/pacientes/p1");
    expect(UIService.get).toHaveBeenCalledWith("/api/pacientes/p1");
  });
});
