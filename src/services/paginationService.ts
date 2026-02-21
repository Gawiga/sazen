export interface PaginationState<T = unknown> {
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
  items: T[];
}

export function getPerPageValue(value: string | null, fallback = 20): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(100, Math.max(1, parsed));
}

export function buildPaginationParams(
  page: number,
  perPage: number,
  extra: Record<string, string | number | undefined> = {},
): URLSearchParams {
  const params = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
  });

  Object.entries(extra).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });

  return params;
}

export function normalizePaginationData<T = unknown>(
  data: Record<string, unknown> | null | undefined,
  fallbackPage = 1,
  fallbackPerPage = 20,
): PaginationState<T> {
  const page = Number(data?.page ?? fallbackPage);
  const perPage = Number(data?.perPage ?? fallbackPerPage);
  const totalPages = Number(data?.totalPages ?? 1);
  const totalItems = Number(data?.totalItems ?? 0);
  const items = Array.isArray(data?.items) ? (data?.items as T[]) : [];

  return {
    page: Number.isFinite(page) && page > 0 ? page : fallbackPage,
    perPage:
      Number.isFinite(perPage) && perPage > 0 ? perPage : fallbackPerPage,
    totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
    totalItems: Number.isFinite(totalItems) && totalItems >= 0 ? totalItems : 0,
    items,
  };
}

export function getPaginationView(page: number, totalPages: number) {
  const safePage = Math.max(1, page || 1);
  const safeTotalPages = Math.max(1, totalPages || 1);

  return {
    canPrev: safePage > 1,
    canNext: safePage < safeTotalPages,
    indicator: `Página ${safePage} de ${safeTotalPages}`,
  };
}
