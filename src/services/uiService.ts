// UIService: Serviço para abstrair lógica de frontend com API
import { decodeJwt } from "~/lib/jwt-helper";

declare global {
  interface Window {
    showLoading?: () => void;
    hideLoading?: () => void;
  }
}

interface FetchOptions extends RequestInit {
  showLoading?: boolean;
  skipRetry?: boolean;
}

interface DecodedToken {
  payload: Record<string, unknown>;
  valid: boolean;
}

export class UIService {
  private static isRefreshing = false;
  private static refreshPromise: Promise<boolean> | null = null;

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

  /**
   * Decodifica e valida um JWT sem expiração
   */
  private static decodeToken(token: string): DecodedToken {
    return decodeJwt(token);
  }

  /**
   * Verifica se o token expira em menos de N segundos
   */
  private static isTokenExpiringSoon(
    token: string,
    thresholdSeconds = 60,
  ): boolean {
    try {
      const { payload } = this.decodeToken(token);
      if (!payload.exp || typeof payload.exp !== "number") return false;

      const now = Math.floor(Date.now() / 1000);
      const expiresIn = (payload.exp as number) - now;
      return expiresIn < thresholdSeconds;
    } catch {
      return false;
    }
  }

  /**
   * Tenta renovar o token via API
   */
  private static async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Inclui cookies httpOnly
      });

      if (!response.ok) {
        // Se falhar, redireciona para login
        this.clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return false;
      }

      const data = (await response.json()) as { token?: string };
      if (data.token) {
        localStorage.setItem("pb_auth", JSON.stringify({ token: data.token }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao renovar token:", error);
      this.clearAuth();
      return false;
    }
  }

  /**
   * Limpa autenticação (logout)
   */
  private static clearAuth(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pb_auth");
    }
  }

  /**
   * Renova token de forma centralizada (com debouncing de requisições simultâneas)
   */
  private static async ensureValidToken(): Promise<boolean> {
    const token = this.getTokenFromLocalStorage();
    if (!token) return false;

    // Se já está renovando, aguarda resultado anterior
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    // Se token expira em pouco tempo, renova
    if (this.isTokenExpiringSoon(token, 60)) {
      this.isRefreshing = true;
      this.refreshPromise = this.refreshToken()
        .then((success) => {
          this.isRefreshing = false;
          this.refreshPromise = null;
          return success;
        })
        .catch(() => {
          this.isRefreshing = false;
          this.refreshPromise = null;
          return false;
        });
      return this.refreshPromise;
    }

    return true;
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
    const { showLoading = true, skipRetry = false, ...restOptions } = options;

    if (showLoading) {
      window.showLoading?.();
    }

    try {
      // Garante token válido antes da requisição (apenas se houver token)
      const token = this.getTokenFromLocalStorage();
      if (token) {
        const tokenValid = await this.ensureValidToken();
        if (!tokenValid && !skipRetry) {
          throw new Error("Token inválido");
        }
      }

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

    // Retry em caso de 401 (token expirou)
    if (res.status === 401 && !options?.skipRetry) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry a requisição com novo token
        return this.get(url, { ...options, skipRetry: true });
      }
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return res.json() as Promise<T>;
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

    // Retry em caso de 401 (token expirou)
    if (res.status === 401 && !options?.skipRetry) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry a requisição com novo token
        return this.post(url, body, { ...options, skipRetry: true });
      }
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return res.json() as Promise<T>;
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

    // Retry em caso de 401 (token expirou)
    if (res.status === 401 && !options?.skipRetry) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry a requisição com novo token
        return this.put(url, body, { ...options, skipRetry: true });
      }
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return res.json() as Promise<T>;
  }

  static async delete<T = void>(
    url: string,
    options?: FetchOptions,
  ): Promise<T> {
    const res = await this.fetchWithAuthAndLoading(url, {
      ...options,
      method: "DELETE",
    });

    // Retry em caso de 401 (token expirou)
    if (res.status === 401 && !options?.skipRetry) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry a requisição com novo token
        return this.delete(url, { ...options, skipRetry: true });
      }
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return res.status === 204 ? (null as T) : (res.json() as Promise<T>);
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
