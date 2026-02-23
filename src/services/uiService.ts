// UIService: Serviço para abstrair lógica de frontend com API
declare global {
  interface Window {
    showLoading?: () => void;
    hideLoading?: () => void;
  }
}

interface FetchOptions extends RequestInit {
  showLoading?: boolean;
}

export class UIService {
  private static getTokenFromLocalStorage(): string | null {
    if (typeof window === "undefined") return null;

    const tokenStr = localStorage.getItem("pb_auth");
    if (!tokenStr) return null;

    try {
      const parsed = JSON.parse(tokenStr);
      return parsed?.token || null;
    } catch {
      return tokenStr;
    }
  }

  static fetchWithAuth(url: string, options: FetchOptions = {}) {
    const token = this.getTokenFromLocalStorage();
    const headers = new Headers(options.headers ?? {});
    headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    return fetch(url, { ...options, headers });
  }

  static async fetchWithAuthAndLoading(
    url: string,
    options: FetchOptions = {},
  ) {
    const { showLoading = true, ...restOptions } = options;

    if (showLoading) {
      window.showLoading?.();
    }

    try {
      return await this.fetchWithAuth(url, restOptions);
    } finally {
      if (showLoading) {
        window.hideLoading?.();
      }
    }
  }

  static async get<T>(url: string, options?: FetchOptions): Promise<T> {
    const res = await this.fetchWithAuthAndLoading(url, {
      ...options,
      method: "GET",
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return res.json();
  }

  static async post<T>(
    url: string,
    body?: unknown,
    options?: FetchOptions,
  ): Promise<T> {
    const res = await this.fetchWithAuthAndLoading(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return res.json();
  }

  static async put<T>(
    url: string,
    body?: unknown,
    options?: FetchOptions,
  ): Promise<T> {
    const res = await this.fetchWithAuthAndLoading(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return res.json();
  }

  static async delete<T = void>(
    url: string,
    options?: FetchOptions,
  ): Promise<T> {
    const res = await this.fetchWithAuthAndLoading(url, {
      ...options,
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return res.status === 204 ? (null as T) : res.json();
  }
}

// Função auxiliar para scroll suave
export function scrollToElement(
  elementId: string,
  options?: ScrollIntoViewOptions,
) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
      ...options,
    });
  }
}
