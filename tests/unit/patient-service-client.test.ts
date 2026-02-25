import { beforeEach, describe, expect, it, vi } from "vitest";
import { PatientService } from "~/services/patientService";
import { UIService } from "~/services/uiService";

vi.mock("~/services/uiService", () => ({
  UIService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("PatientService (client)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getPatients should call API with page/perPage", async () => {
    vi.mocked(UIService.get).mockResolvedValueOnce({
      page: 1,
      perPage: 20,
      totalPages: 1,
      totalItems: 0,
      items: [],
    });

    await PatientService.getPatients(1, 20);

    expect(UIService.get).toHaveBeenCalledWith(
      "/api/pacientes?page=1&perPage=20",
    );
  });

  it("create/update/delete/get by id should call expected endpoints", async () => {
    vi.mocked(UIService.post).mockResolvedValueOnce({ id: "p1", nome: "Ana" });
    vi.mocked(UIService.put).mockResolvedValueOnce({ id: "p1", nome: "Ana 2" });
    vi.mocked(UIService.delete).mockResolvedValueOnce(undefined);
    vi.mocked(UIService.get).mockResolvedValueOnce({ id: "p1", nome: "Ana 2" });

    await PatientService.createPatient({ nome: "Ana" });
    await PatientService.updatePatient("p1", { nome: "Ana 2" });
    await PatientService.deletePatient("p1");
    await PatientService.getPatient("p1");

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
