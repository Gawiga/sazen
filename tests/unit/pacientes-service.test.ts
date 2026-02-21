/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getFullListMock,
  createMock,
  getOneMock,
  updateMock,
  deleteMock,
  saveMock,
  getTokenFromRequestMock,
  decodeJwtMock,
} = vi.hoisted(() => ({
  getFullListMock: vi.fn(),
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
      getFullList: getFullListMock,
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
  createPaciente,
  deletePaciente,
  getPacienteById,
  listPacientes,
  updatePaciente,
} from "../../src/services/pacientesService";

describe("pacientesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna 401 sem token", async () => {
    getTokenFromRequestMock.mockReturnValue(null);

    const response = await listPacientes(
      new Request("https://example.com/api/pacientes"),
      {},
    );

    expect(response.status).toBe(401);
    expect(getFullListMock).not.toHaveBeenCalled();
  });

  it("lista pacientes autenticados", async () => {
    getTokenFromRequestMock.mockReturnValue("jwt_token");
    getFullListMock.mockResolvedValue([{ id: "p1" }, { id: "p2" }]);

    const response = await listPacientes(
      new Request("https://example.com/api/pacientes"),
      {},
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(getFullListMock).toHaveBeenCalledWith({ sort: "-created" });
    expect(body.items).toHaveLength(2);
  });

  it("injeta owner no create usando user.id do token", async () => {
    getTokenFromRequestMock.mockReturnValue("jwt_token");
    decodeJwtMock.mockReturnValue({ valid: true, payload: { id: "user_abc" } });
    createMock.mockResolvedValue({ id: "p1" });

    const response = await createPaciente(
      new Request("https://example.com/api/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: "Maria" }),
      }),
      {},
    );

    expect(response.status).toBe(201);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: "Maria",
        owner: "user_abc",
      }),
    );
  });

  it("busca, atualiza e exclui paciente por id", async () => {
    getTokenFromRequestMock.mockReturnValue("jwt_token");
    getOneMock.mockResolvedValue({ id: "p1" });
    updateMock.mockResolvedValue({ id: "p1", nome: "Novo" });
    deleteMock.mockResolvedValue(true);

    const getResponse = await getPacienteById(
      "p1",
      new Request("https://example.com"),
      {},
    );
    expect(getResponse.status).toBe(200);

    const updateResponse = await updatePaciente(
      "p1",
      new Request("https://example.com", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: "Novo" }),
      }),
      {},
    );

    expect(updateResponse.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith("p1", { nome: "Novo" });

    const deleteResponse = await deletePaciente(
      "p1",
      new Request("https://example.com"),
      {},
    );
    expect(deleteResponse.status).toBe(200);
    expect(deleteMock).toHaveBeenCalledWith("p1");
  });
});
