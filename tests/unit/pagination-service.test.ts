import { describe, expect, it } from "vitest";
import {
  buildPaginationParams,
  getPaginationView,
  getPerPageValue,
  normalizePaginationData,
} from "../../src/services/paginationService";

describe("paginationService", () => {
  it("getPerPageValue retorna fallback quando inválido", () => {
    expect(getPerPageValue(null)).toBe(20);
    expect(getPerPageValue("abc")).toBe(20);
    expect(getPerPageValue("0")).toBe(20);
  });

  it("getPerPageValue aplica clamp em [1,100]", () => {
    expect(getPerPageValue("50")).toBe(50);
    expect(getPerPageValue("999")).toBe(100);
    expect(getPerPageValue("-10", 20)).toBe(20);
  });

  it("buildPaginationParams monta query com extras", () => {
    const params = buildPaginationParams(2, 50, {
      collection: "valores_receber",
      sort: "-data",
    });

    expect(params.get("page")).toBe("2");
    expect(params.get("perPage")).toBe("50");
    expect(params.get("collection")).toBe("valores_receber");
    expect(params.get("sort")).toBe("-data");
  });

  it("normalizePaginationData normaliza payload", () => {
    const normalized = normalizePaginationData(
      {
        page: 3,
        perPage: 20,
        totalPages: 5,
        totalItems: 99,
        items: [{ id: "1" }],
      },
      1,
      20,
    );

    expect(normalized.page).toBe(3);
    expect(normalized.perPage).toBe(20);
    expect(normalized.totalPages).toBe(5);
    expect(normalized.totalItems).toBe(99);
    expect(normalized.items).toHaveLength(1);
  });

  it("getPaginationView calcula estados e indicador", () => {
    expect(getPaginationView(1, 3)).toEqual({
      canPrev: false,
      canNext: true,
      indicator: "Página 1 de 3",
    });

    expect(getPaginationView(3, 3)).toEqual({
      canPrev: true,
      canNext: false,
      indicator: "Página 3 de 3",
    });
  });
});
