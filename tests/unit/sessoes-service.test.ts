import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  sessaoGetListMock,
  createMock,
  sessaoGetOneMock,
  updateMock,
  deleteMock,
  pacienteGetListMock,
  pacienteGetOneMock,
  saveMock,
  getTokenFromRequestMock,
  decodeJwtMock,
} = vi.hoisted(() => ({
  sessaoGetListMock: vi.fn(),
  createMock: vi.fn(),
  sessaoGetOneMock: vi.fn(),
  updateMock: vi.fn(),
  deleteMock: vi.fn(),
  pacienteGetListMock: vi.fn(),
  pacienteGetOneMock: vi.fn(),
  saveMock: vi.fn(),
  getTokenFromRequestMock: vi.fn(),
  decodeJwtMock: vi.fn(),
}));

vi.mock("pocketbase", () => {
  class MockPocketBase {
    authStore = { save: saveMock };
    collection = vi.fn((name: string) => {
      if (name === "paciente") {
        return {
          getList: pacienteGetListMock,
          getOne: pacienteGetOneMock,
        };
      }

      return {
        getList: sessaoGetListMock,
        create: createMock,
        getOne: sessaoGetOneMock,
        update: updateMock,
        delete: deleteMock,
      };
    });
  }

  return {
    default: MockPocketBase,
  };
});

vi.mock("../../src/lib/jwt-helper", () => ({
  getTokenFromRequest: getTokenFromRequestMock,
  decodeJwt: decodeJwtMock,
}));

import { SessaoService } from "../../src/services/sessaoService";

const {
  createSessao,
  deleteSessao,
  getSessaoById,
  listPendingSessoesForPreview,
  listSessoes,
  paySingleSessaoFromPreview,
  payAllPendingSessoesByMonth,
  updateSessao,
} = SessaoService;

describe("sessoesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna 401 quando token não existe", async () => {
    getTokenFromRequestMock.mockReturnValue(null);

    const response = await listSessoes(
      new Request("https://example.com/api/sessoes"),
      {},
    );

    expect(response.status).toBe(401);
    expect(sessaoGetListMock).not.toHaveBeenCalled();
  });

  it("retorna 401 quando PocketBase responde token inválido", async () => {
    getTokenFromRequestMock.mockReturnValue("jwt_token");
    sessaoGetListMock.mockRejectedValue({
      status: 401,
      message: "Unauthorized",
    });

    const response = await listSessoes(
      new Request("https://example.com/api/sessoes"),
      {},
    );

    expect(response.status).toBe(401);
  });

  it("lista sessões com paginação padrão de 20 por página", async () => {
    getTokenFromRequestMock.mockReturnValue("jwt_token");
    sessaoGetListMock.mockResolvedValue({
      page: 1,
      perPage: 20,
      totalPages: 1,
      totalItems: 2,
      items: [{ id: "s1" }, { id: "s2" }],
    });

    const response = await listSessoes(
      new Request("https://example.com/api/sessoes"),
      {},
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(sessaoGetListMock).toHaveBeenCalledWith(1, 20, { sort: "-data" });
    expect(body.perPage).toBe(20);
    expect(body.items).toHaveLength(2);
  });

  it("aplica clamp de perPage para no máximo 100", async () => {
    getTokenFromRequestMock.mockReturnValue("jwt_token");
    sessaoGetListMock.mockResolvedValue({
      page: 1,
      perPage: 100,
      totalPages: 1,
      totalItems: 0,
      items: [],
    });

    await listSessoes(
      new Request(
        "https://example.com/api/sessoes?page=0&perPage=999&sort=-data",
      ),
      {},
    );

    expect(sessaoGetListMock).toHaveBeenCalledWith(1, 100, { sort: "-data" });
  });

  it("injeta owner com user.id do token ao criar sessão", async () => {
    getTokenFromRequestMock.mockReturnValue("jwt_token");
    decodeJwtMock.mockReturnValue({ valid: true, payload: { id: "user_123" } });
    createMock.mockResolvedValue({ id: "new_session" });

    const response = await createSessao(
      new Request("https://example.com/api/sessoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_paciente: "p1", valor: 200, pago: false }),
      }),
      {},
    );

    expect(response.status).toBe(201);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id_paciente: "p1",
        owner: "user_123",
      }),
    );
  });

  it("busca, atualiza e remove sessão por id", async () => {
    getTokenFromRequestMock.mockReturnValue("jwt_token");
    sessaoGetOneMock.mockResolvedValue({ id: "s1" });
    updateMock.mockResolvedValue({ id: "s1", pago: true });
    deleteMock.mockResolvedValue(true);

    const getResponse = await getSessaoById(
      "s1",
      new Request("https://example.com"),
      {},
    );
    expect(getResponse.status).toBe(200);

    const updateResponse = await updateSessao(
      "s1",
      new Request("https://example.com", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pago: true }),
      }),
      {},
    );
    expect(updateResponse.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith("s1", { pago: true });

    const deleteResponse = await deleteSessao(
      "s1",
      new Request("https://example.com"),
      {},
    );
    expect(deleteResponse.status).toBe(200);
    expect(deleteMock).toHaveBeenCalledWith("s1");
  });

  it("quita somente sessões pendentes do paciente no mês informado", async () => {
    getTokenFromRequestMock.mockReturnValue("jwt_token");
    decodeJwtMock.mockReturnValue({
      valid: true,
      payload: { id: "owner_abc" },
    });
    pacienteGetOneMock.mockResolvedValue({ id: "pac_1", owner: "owner_abc" });
    sessaoGetListMock.mockResolvedValueOnce({
      page: 1,
      totalPages: 1,
      items: [{ id: "s1" }, { id: "s2" }],
    });
    updateMock.mockResolvedValue({ success: true });

    const response = await payAllPendingSessoesByMonth(
      new Request("https://example.com/api/sessoes/pay-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthKey: "2026-02",
          ownerId: "owner_abc",
          patientId: "pac_1",
        }),
      }),
      {},
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(sessaoGetListMock).toHaveBeenCalledWith(
      1,
      100,
      expect.objectContaining({
        filter: expect.stringContaining('owner = "owner_abc"'),
      }),
    );
    expect(sessaoGetListMock).toHaveBeenCalledWith(
      1,
      100,
      expect.objectContaining({
        filter: expect.stringContaining('id_paciente = "pac_1"'),
      }),
    );
    expect(sessaoGetListMock).toHaveBeenCalledWith(
      1,
      100,
      expect.objectContaining({
        filter: expect.stringContaining("pago = false"),
      }),
    );
    expect(updateMock).toHaveBeenCalledTimes(2);
    expect(body.updatedCount).toBe(2);
  });

  it("retorna 400 quando paciente não é informado", async () => {
    getTokenFromRequestMock.mockReturnValue("jwt_token");
    decodeJwtMock.mockReturnValue({
      valid: true,
      payload: { id: "owner_abc" },
    });

    const response = await payAllPendingSessoesByMonth(
      new Request("https://example.com/api/sessoes/pay-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthKey: "2026-02" }),
      }),
      {},
    );

    expect(response.status).toBe(400);
    expect(sessaoGetListMock).not.toHaveBeenCalled();
  });

  it("retorna 409 quando patientName é ambíguo", async () => {
    getTokenFromRequestMock.mockReturnValue("jwt_token");
    decodeJwtMock.mockReturnValue({
      valid: true,
      payload: { id: "owner_abc" },
    });
    pacienteGetListMock.mockResolvedValue({
      totalItems: 2,
      items: [{ id: "pac_1" }, { id: "pac_2" }],
    });

    const response = await payAllPendingSessoesByMonth(
      new Request("https://example.com/api/sessoes/pay-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthKey: "2026-02",
          patientName: "Maria",
        }),
      }),
      {},
    );

    expect(response.status).toBe(409);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("preview retorna apenas sessões pendentes do owner/paciente/mês", async () => {
    getTokenFromRequestMock.mockReturnValue("jwt_token");
    decodeJwtMock.mockReturnValue({
      valid: true,
      payload: { id: "owner_abc" },
    });
    pacienteGetOneMock.mockResolvedValue({ id: "pac_1", nome: "Maria" });
    sessaoGetListMock.mockResolvedValueOnce({
      page: 1,
      totalPages: 1,
      items: [
        {
          id: "s1",
          id_paciente: "pac_1",
          data: "2026-02-10T10:00:00.000Z",
          valor: 120,
          pago: false,
        },
      ],
    });

    const response = await listPendingSessoesForPreview(
      new Request("https://example.com/api/sessoes/pending-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthKey: "2026-02",
          ownerId: "owner_abc",
          patientId: "pac_1",
        }),
      }),
      {},
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(sessaoGetListMock).toHaveBeenCalledWith(
      1,
      100,
      expect.objectContaining({
        filter: expect.stringContaining('owner = "owner_abc"'),
      }),
    );
    expect(sessaoGetListMock).toHaveBeenCalledWith(
      1,
      100,
      expect.objectContaining({
        filter: expect.stringContaining('id_paciente = "pac_1"'),
      }),
    );
    expect(sessaoGetListMock).toHaveBeenCalledWith(
      1,
      100,
      expect.objectContaining({
        filter: expect.stringContaining("pago = false"),
      }),
    );
    expect(body.totalItems).toBe(1);
    expect(body.items[0]?.id).toBe("s1");
  });

  it("pay-single bloqueia confirmação quando paciente informado não corresponde à sessão", async () => {
    getTokenFromRequestMock.mockReturnValue("jwt_token");
    decodeJwtMock.mockReturnValue({
      valid: true,
      payload: { id: "owner_abc" },
    });
    sessaoGetOneMock.mockResolvedValue({
      id: "s1",
      owner: "owner_abc",
      id_paciente: "pac_2",
      data: "2026-02-10T10:00:00.000Z",
      pago: false,
    });

    const response = await paySingleSessaoFromPreview(
      new Request("https://example.com/api/sessoes/pay-single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "s1",
          monthKey: "2026-02",
          ownerId: "owner_abc",
          patientId: "pac_1",
        }),
      }),
      {},
    );

    expect(response.status).toBe(409);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("pay-single exige patientId ou patientName para evitar quitação fora de escopo", async () => {
    getTokenFromRequestMock.mockReturnValue("jwt_token");
    decodeJwtMock.mockReturnValue({
      valid: true,
      payload: { id: "owner_abc" },
    });
    sessaoGetOneMock.mockResolvedValue({
      id: "s1",
      owner: "owner_abc",
      id_paciente: "pac_2",
      data: "2026-02-10T10:00:00.000Z",
      pago: false,
    });

    const response = await paySingleSessaoFromPreview(
      new Request("https://example.com/api/sessoes/pay-single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "s1",
          monthKey: "2026-02",
          ownerId: "owner_abc",
        }),
      }),
      {},
    );

    expect(response.status).toBe(400);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("pay-single atualiza somente sessão pendente no escopo validado", async () => {
    getTokenFromRequestMock.mockReturnValue("jwt_token");
    decodeJwtMock.mockReturnValue({
      valid: true,
      payload: { id: "owner_abc" },
    });
    sessaoGetOneMock.mockResolvedValue({
      id: "s1",
      owner: "owner_abc",
      id_paciente: "pac_1",
      data: "2026-02-12T19:00:00.000Z",
      pago: false,
    });
    updateMock.mockResolvedValue({ id: "s1", pago: true });

    const response = await paySingleSessaoFromPreview(
      new Request("https://example.com/api/sessoes/pay-single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "s1",
          monthKey: "2026-02",
          ownerId: "owner_abc",
          patientId: "pac_1",
        }),
      }),
      {},
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith("s1", { pago: true });
    expect(body.updated).toBe(true);
  });
});
