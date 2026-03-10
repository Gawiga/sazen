/* eslint-disable @typescript-eslint/no-explicit-any */
import PocketBase from "pocketbase";
import { decodeJwt, getTokenFromRequest } from "../lib/jwt-helper";

const POCKETBASE_URL =
  import.meta.env.PUBLIC_POCKETBASE_URL ||
  "https://gawiga-server.bonito-dace.ts.net/";

const EMPTY_RECORD_MODEL = { collectionId: "", collectionName: "", id: "" };

export type CookiesLike = {
  get?: (name: string) => { value: string } | undefined | null;
};

export type PaginationOptions = {
  defaultPage?: number;
  defaultPerPage?: number;
  minPerPage?: number;
  maxPerPage?: number;
};

const DEFAULT_PAGINATION: Required<PaginationOptions> = {
  defaultPage: 1,
  defaultPerPage: 20,
  minPerPage: 1,
  maxPerPage: 100,
};

export function getErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") return null;

  const statusDirect = (error as { status?: unknown }).status;
  if (typeof statusDirect === "number") return statusDirect;

  const response = (error as { response?: { status?: unknown } }).response;
  if (response && typeof response.status === "number") return response.status;

  return null;
}

export function unauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({ success: false, error: "Unauthorized" }),
    { status: 401 },
  );
}

export function getPb(
  token?: string,
  options?: { useEmptyRecordModel?: boolean },
) {
  const pb = new PocketBase(POCKETBASE_URL);

  if (token) {
    const model = options?.useEmptyRecordModel
      ? EMPTY_RECORD_MODEL
      : ({} as any);
    pb.authStore.save(token, model);
  }

  return pb;
}

export function getTokenOrUnauthorized(
  request: Request,
  cookies: CookiesLike,
): { token?: string; response?: Response } {
  const token = getTokenFromRequest(request, cookies);
  if (!token) {
    return { response: unauthorizedResponse() };
  }

  return { token };
}

export function getOwnerIdFromToken(token: string): string | null {
  const decoded = decodeJwt(token);
  if (!decoded.valid) return null;

  const userId = decoded.payload.id;
  return typeof userId === "string" && userId.length > 0 ? userId : null;
}

export function parsePagination(
  url: URL,
  options?: PaginationOptions,
): { page: number; perPage: number } {
  const settings = { ...DEFAULT_PAGINATION, ...options };

  const pageRaw = Number.parseInt(
    url.searchParams.get("page") || String(settings.defaultPage),
    10,
  );
  const perPageRaw = Number.parseInt(
    url.searchParams.get("perPage") || String(settings.defaultPerPage),
    10,
  );

  const page = Number.isNaN(pageRaw)
    ? settings.defaultPage
    : Math.max(settings.defaultPage, pageRaw);

  const perPage = Number.isNaN(perPageRaw)
    ? settings.defaultPerPage
    : Math.max(settings.minPerPage, Math.min(settings.maxPerPage, perPageRaw));

  return { page, perPage };
}
