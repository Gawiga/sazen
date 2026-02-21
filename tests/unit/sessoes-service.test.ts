import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getListMock,
  createMock,
  getOneMock,
  updateMock,
  deleteMock,
  saveMock,
  getTokenFromRequestMock,
  decodeJwtMock,
} = vi.hoisted(() => ({
  getListMock: vi.fn(),
  createMock: vi.fn(),
  getOneMock: vi.fn(),
  updateMock: vi.fn(),
  deleteMock: vi.fn(),
  saveMock: vi.fn(),
  getTokenFromRequestMock: vi.fn(),
  decodeJwtMock: vi.fn(),
}));

vi.mock("pocketbase", () => {
  class MockPocketBase {
    authStore = { save: saveMock };
    collection = vi.fn(() => ({
      getList: getListMock,
      create: createMock,
      getOne: getOneMock,
      update: updateMock,
      delete: deleteMock,
    }));
  }

  return {
    default: MockPocketBase,
  };
});

vi.mock("../../src/lib/jwt-helper", () => ({
  getTokenFromRequest: getTokenFromRequestMock,
  decodeJwt: decodeJwtMock,
}));

import {
  createSessao,
  deleteSessao,
  getSessaoById,
  listSessoes,
  updateSessao,
} from "../../src/services/sessoesService";

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
    expect(getListMock).not.toHaveBeenCalled();
  });

  it("lista sessões com paginação padrão de 10 por página", async () => {
    getTokenFromRequestMock.mockReturnValue("jwt_token");
    getListMock.mockResolvedValue({
      page: 1,
      perPage: 10,
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
    expect(getListMock).toHaveBeenCalledWith(1, 10, { sort: "-data" });
    expect(body.perPage).toBe(10);
    expect(body.items).toHaveLength(2);
  });

  it("aplica clamp de perPage para no máximo 100", async () => {
    getTokenFromRequestMock.mockReturnValue("jwt_token");
    getListMock.mockResolvedValue({
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

    expect(getListMock).toHaveBeenCalledWith(1, 100, { sort: "-data" });
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
    getOneMock.mockResolvedValue({ id: "s1" });
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
});
