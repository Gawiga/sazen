import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getTokenFromRequestMock,
  authStoreSaveMock,
  sessaoGetListMock,
  pacienteGetOneMock,
  faturamentoGetListMock,
} = vi.hoisted(() => ({
  getTokenFromRequestMock: vi.fn(),
  authStoreSaveMock: vi.fn(),
  sessaoGetListMock: vi.fn(),
  pacienteGetOneMock: vi.fn(),
  faturamentoGetListMock: vi.fn(),
}));

vi.mock("pocketbase", () => {
  class MockPocketBase {
    authStore = { save: authStoreSaveMock };

    collection(name: string) {
      if (name === "sessao") {
        return {
          getList: sessaoGetListMock,
        };
      }

      if (name === "paciente") {
        return {
          getOne: pacienteGetOneMock,
        };
      }

      if (name === "faturamento_mensal") {
        return {
          getList: faturamentoGetListMock,
        };
      }

      return {
        getList: vi.fn(),
      };
    }
  }

  return { default: MockPocketBase };
});

vi.mock("~/lib/jwt-helper", () => ({
  getTokenFromRequest: getTokenFromRequestMock,
}));

import { GET } from "~/pages/api/reports/index";

describe("Reports API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTokenFromRequestMock.mockReturnValue("valid-token");

    sessaoGetListMock.mockResolvedValue({
      page: 1,
      perPage: 100,
      totalPages: 1,
      totalItems: 0,
      items: [],
    });
    pacienteGetOneMock.mockResolvedValue({ id: "pac_1", nome: "Maria" });
    faturamentoGetListMock.mockResolvedValue({
      page: 1,
      perPage: 20,
      totalPages: 1,
      totalItems: 0,
      items: [],
    });
  });

  it("returns 401 when token is missing", async () => {
    getTokenFromRequestMock.mockReturnValue(null);
    const request = new Request(
      "http://localhost/api/reports?collection=valores_receber",
    );

    const response = await GET({ request, cookies: {} } as never);
    expect(response.status).toBe(401);
  });

  it("returns paginated data when collection query is provided", async () => {
    sessaoGetListMock.mockResolvedValueOnce({
      page: 1,
      perPage: 100,
      totalPages: 1,
      totalItems: 2,
      items: [
        {
          id: "s_1",
          id_paciente: "pac_1",
          owner: "owner_1",
          data: "2026-03-10T10:00:00.000Z",
          valor: 100,
          pago: false,
        },
        {
          id: "s_2",
          id_paciente: "pac_1",
          owner: "owner_1",
          data: "2026-03-11T10:00:00.000Z",
          valor: 200,
          pago: false,
        },
      ],
    });

    const request = new Request(
      "http://localhost/api/reports?collection=valores_receber&page=2&perPage=50",
    );

    const response = await GET({ request, cookies: {} } as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(sessaoGetListMock).toHaveBeenCalledWith(
      1,
      100,
      expect.objectContaining({
        filter: "pago = false",
      }),
    );
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toEqual(
      expect.objectContaining({
        nome: "Maria",
        id_paciente: "pac_1",
        total: 300,
      }),
    );
  });
});
