// Helper para gerenciar loading em chamadas API
export function createFetchWithLoading(getToken: () => string | null) {
  return async function fetchWithAuthAndLoading(
    url: string,
    options: RequestInit = {},
    showLoader = true
  ) {
    if (showLoader) {
      window.showLoading?.();
    }

    try {
      const token = getToken();
      const headers = new Headers(options.headers ?? {});
      headers.set("Content-Type", "application/json");
      if (token) headers.set("Authorization", `Bearer ${token}`);

      const response = await fetch(url, { ...options, headers });
      return response;
    } finally {
      if (showLoader) {
        window.hideLoading?.();
      }
    }
  };
}

// Tipo para o helper
export type FetchWithAuthAndLoading = (
  url: string,
  options?: RequestInit,
  showLoader?: boolean
) => Promise<Response>;
