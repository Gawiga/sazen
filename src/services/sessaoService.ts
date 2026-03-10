import type PocketBase from "pocketbase";
import { UIService } from "./uiService";
import type {
  BulkPayOwnerMonthPayload,
  PaySingleSessionPayload,
  PendingSessionPreviewItem,
  Sessao,
} from "~/types/sessao";
import type { PacienteOption } from "~/types/paciente";
import type { PaginatedResponse } from "~/types/shared";
import {
  type CookiesLike,
  getErrorStatus,
  getOwnerIdFromToken,
  getPb,
  getTokenOrUnauthorized,
  parsePagination,
  unauthorizedResponse,
} from "./sharedService";

const MAX_BULK_UPDATE_PER_PAGE = 100;
const PACIENTE_COLLECTION = "paciente";
const SESSAO_COLLECTION = "sessao";

function normalizeMonthKey(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;

  if (/^\d{4}-\d{2}$/.test(normalized)) return normalized;
  if (/^\d{4}\/\d{2}$/.test(normalized)) return normalized.replace("/", "-");

  const monthYear = normalized.match(/^(\d{1,2})\/(\d{4})$/);
  if (monthYear) {
    const month = Number(monthYear[1]);
    const year = Number(monthYear[2]);
    if (month >= 1 && month <= 12) {
      return `${year}-${String(month).padStart(2, "0")}`;
    }
  }

  return null;
}

function getMonthBounds(monthKey: string): {
  startIso: string;
  endIso: string;
} | null {
  const match = monthKey.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null;
  if (month < 1 || month > 12) return null;

  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0));

  return {
    startIso: startDate.toISOString(),
    endIso: endDate.toISOString(),
  };
}

function escapeFilterValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeTextForCompare(value: string | null | undefined): string {
  return (value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function isDateInMonthRange(
  dateValue: string,
  bounds: { startIso: string; endIso: string },
) {
  const time = new Date(dateValue).getTime();
  if (Number.isNaN(time)) return false;
  const start = new Date(bounds.startIso).getTime();
  const end = new Date(bounds.endIso).getTime();
  return time >= start && time < end;
}

async function resolvePatientIdForBulkPayment(
  pb: PocketBase,
  ownerId: string,
  patientId: string | null,
  patientName: string | null,
): Promise<
  { ok: true; patientId: string } | { ok: false; status: number; error: string }
> {
  if (patientId) {
    try {
      const patient = await pb
        .collection(PACIENTE_COLLECTION)
        .getOne(patientId);
      const patientOwner =
        typeof patient?.owner === "string" && patient.owner.trim()
          ? patient.owner.trim()
          : null;

      if (patientOwner && patientOwner !== ownerId) {
        return { ok: false, status: 403, error: "Forbidden patientId" };
      }

      return { ok: true, patientId };
    } catch (error) {
      if (getErrorStatus(error) === 404) {
        return { ok: false, status: 404, error: "Patient not found" };
      }
      throw error;
    }
  }

  if (!patientName) {
    return {
      ok: false,
      status: 400,
      error: "patientId or patientName is required",
    };
  }

  const escapedOwner = escapeFilterValue(ownerId);
  const escapedName = escapeFilterValue(patientName);
  const list = await pb.collection(PACIENTE_COLLECTION).getList(1, 3, {
    filter: `owner = "${escapedOwner}" && nome = "${escapedName}"`,
  });

  if (list.totalItems === 0) {
    return {
      ok: false,
      status: 404,
      error: "Patient not found for this owner",
    };
  }

  if (list.totalItems > 1) {
    return {
      ok: false,
      status: 409,
      error:
        "Ambiguous patientName. Provide patientId to avoid incorrect payment updates.",
    };
  }

  const matchedId =
    typeof list.items[0]?.id === "string" && list.items[0].id.trim()
      ? list.items[0].id.trim()
      : null;

  if (!matchedId) {
    return { ok: false, status: 404, error: "Patient not found" };
  }

  return { ok: true, patientId: matchedId };
}

async function getPatientNamesMap(
  pb: PocketBase,
  patientIds: string[],
): Promise<Map<string, string>> {
  const uniquePatientIds = Array.from(
    new Set(patientIds.filter((id) => typeof id === "string" && id.trim())),
  );
  const nameMap = new Map<string, string>();

  await Promise.all(
    uniquePatientIds.map(async (id) => {
      try {
        const patient = await pb.collection(PACIENTE_COLLECTION).getOne(id);
        const patientName =
          typeof patient?.nome === "string" && patient.nome.trim()
            ? patient.nome.trim()
            : "";
        if (patientName) {
          nameMap.set(id, patientName);
        }
      } catch {
        // Ignore missing patients in preview generation.
      }
    }),
  );

  return nameMap;
}

export class SessaoService {
  // Client-side methods
  static async getAllPatients(): Promise<PacienteOption[]> {
    try {
      let allPatients: PacienteOption[] = [];
      let page = 1;
      const perPage = 100;

      while (true) {
        const url = `/api/pacientes?page=${page}&perPage=${perPage}&status=todos`;
        const data = await UIService.get<PaginatedResponse<PacienteOption>>(
          url,
          {
            showLoading: page === 1,
          },
        );

        allPatients = allPatients.concat(data.items);

        if (page >= data.totalPages) break;
        page += 1;
      }

      return allPatients.sort((a, b) =>
        (a.nome || "").localeCompare(b.nome || ""),
      );
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error);
      throw error;
    }
  }

  static async getSessions(
    page: number,
    perPage: number,
    sort = "-data",
  ): Promise<PaginatedResponse<Sessao>> {
    const url = `/api/sessoes?page=${page}&perPage=${perPage}&sort=${sort}`;
    return UIService.get<PaginatedResponse<Sessao>>(url);
  }

  static async createSession(payload: Partial<Sessao>): Promise<Sessao> {
    return UIService.post<Sessao>("/api/sessoes", payload);
  }

  static async updateSession(
    id: string,
    payload: Partial<Sessao>,
  ): Promise<Sessao> {
    return UIService.put<Sessao>(`/api/sessoes/${id}`, payload);
  }

  static async deleteSession(id: string): Promise<void> {
    await UIService.delete(`/api/sessoes/${id}`);
  }

  static async togglePaymentStatus(
    id: string,
    currentStatus: boolean,
  ): Promise<Sessao> {
    return UIService.put<Sessao>(`/api/sessoes/${id}`, {
      pago: !currentStatus,
    });
  }

  static async payAllPendingByMonth(
    payload: BulkPayOwnerMonthPayload,
  ): Promise<{ success: boolean; updatedCount: number }> {
    return UIService.post<{ success: boolean; updatedCount: number }>(
      "/api/sessoes/pay-all",
      payload,
    );
  }

  static async getPendingSessionsPreview(
    payload: BulkPayOwnerMonthPayload,
  ): Promise<{ success: boolean; items: PendingSessionPreviewItem[] }> {
    return UIService.post<{
      success: boolean;
      items: PendingSessionPreviewItem[];
    }>("/api/sessoes/pending-preview", payload);
  }

  static async paySingleSession(
    payload: PaySingleSessionPayload,
  ): Promise<{ success: boolean; updated: boolean }> {
    return UIService.post<{ success: boolean; updated: boolean }>(
      "/api/sessoes/pay-single",
      payload,
      { showLoading: false },
    );
  }

  // Server-side methods
  static async listSessoes(
    request: Request,
    cookies: CookiesLike,
  ): Promise<Response> {
    try {
      const auth = getTokenOrUnauthorized(request, cookies);
      if (auth.response) return auth.response;

      const { page, perPage } = parsePagination(new URL(request.url));
      const sort = new URL(request.url).searchParams.get("sort") || "-data";
      const pb = getPb(auth.token);
      const list = await pb
        .collection(SESSAO_COLLECTION)
        .getList(page, perPage, {
          sort,
        });

      return new Response(
        JSON.stringify({
          success: true,
          page: list.page,
          perPage: list.perPage,
          totalPages: list.totalPages,
          totalItems: list.totalItems,
          items: list.items,
        }),
        { status: 200 },
      );
    } catch (error) {
      if (getErrorStatus(error) === 401) return unauthorizedResponse();
      console.error("sessoes GET error", error);
      return new Response(
        JSON.stringify({ success: false, error: String(error) }),
        { status: 500 },
      );
    }
  }

  static async createSessao(
    request: Request,
    cookies: CookiesLike,
  ): Promise<Response> {
    try {
      const auth = getTokenOrUnauthorized(request, cookies);
      if (auth.response) return auth.response;
      if (!auth.token) return unauthorizedResponse();

      const pb = getPb(auth.token);
      const payload = await request.json();
      const owner = getOwnerIdFromToken(auth.token);

      if (owner) {
        payload.owner = owner;
      }

      const record = await pb.collection(SESSAO_COLLECTION).create(payload);
      return new Response(JSON.stringify({ success: true, record }), {
        status: 201,
      });
    } catch (error) {
      if (getErrorStatus(error) === 401) return unauthorizedResponse();
      console.error("sessoes POST error", error);
      return new Response(
        JSON.stringify({ success: false, error: String(error) }),
        { status: 400 },
      );
    }
  }

  static async getSessaoById(
    id: string | undefined,
    request: Request,
    cookies: CookiesLike,
  ): Promise<Response> {
    try {
      if (!id) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid ID" }),
          { status: 400 },
        );
      }

      const auth = getTokenOrUnauthorized(request, cookies);
      if (auth.response) return auth.response;

      const pb = getPb(auth.token);
      const record = await pb.collection(SESSAO_COLLECTION).getOne(id);
      return new Response(JSON.stringify({ success: true, record }), {
        status: 200,
      });
    } catch (error) {
      if (getErrorStatus(error) === 401) return unauthorizedResponse();
      console.error("sessao GET error", error);
      return new Response(
        JSON.stringify({ success: false, error: String(error) }),
        { status: 404 },
      );
    }
  }

  static async updateSessao(
    id: string | undefined,
    request: Request,
    cookies: CookiesLike,
  ): Promise<Response> {
    try {
      if (!id) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid ID" }),
          { status: 400 },
        );
      }

      const auth = getTokenOrUnauthorized(request, cookies);
      if (auth.response) return auth.response;

      const payload = await request.json();
      const pb = getPb(auth.token);
      const record = await pb.collection(SESSAO_COLLECTION).update(id, payload);

      return new Response(JSON.stringify({ success: true, record }), {
        status: 200,
      });
    } catch (error) {
      if (getErrorStatus(error) === 401) return unauthorizedResponse();
      console.error("sessao PUT error", error);
      return new Response(
        JSON.stringify({ success: false, error: String(error) }),
        { status: 400 },
      );
    }
  }

  static async deleteSessao(
    id: string | undefined,
    request: Request,
    cookies: CookiesLike,
  ): Promise<Response> {
    try {
      if (!id) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid ID" }),
          { status: 400 },
        );
      }

      const auth = getTokenOrUnauthorized(request, cookies);
      if (auth.response) return auth.response;

      const pb = getPb(auth.token);
      await pb.collection(SESSAO_COLLECTION).delete(id);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
      if (getErrorStatus(error) === 401) return unauthorizedResponse();
      console.error("sessao DELETE error", error);
      return new Response(
        JSON.stringify({ success: false, error: String(error) }),
        { status: 400 },
      );
    }
  }

  static async payAllPendingSessoesByMonth(
    request: Request,
    cookies: CookiesLike,
  ): Promise<Response> {
    try {
      const auth = getTokenOrUnauthorized(request, cookies);
      if (auth.response) return auth.response;
      if (!auth.token) return unauthorizedResponse();

      let body: {
        monthKey?: string;
        ownerId?: string;
        patientId?: string;
        patientName?: string;
      } | null = null;
      try {
        body = (await request.json()) as {
          monthKey?: string;
          ownerId?: string;
          patientId?: string;
          patientName?: string;
        };
      } catch {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid JSON payload" }),
          { status: 400 },
        );
      }

      const normalizedMonthKey = normalizeMonthKey(body?.monthKey);
      if (!normalizedMonthKey) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid monthKey" }),
          { status: 400 },
        );
      }

      const ownerFromToken = getOwnerIdFromToken(auth.token);
      if (!ownerFromToken) return unauthorizedResponse();

      const ownerFromBody = normalizeString(body?.ownerId);
      if (ownerFromBody && ownerFromBody !== ownerFromToken) {
        return new Response(
          JSON.stringify({ success: false, error: "Forbidden ownerId" }),
          { status: 403 },
        );
      }

      const bounds = getMonthBounds(normalizedMonthKey);
      if (!bounds) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid monthKey range" }),
          { status: 400 },
        );
      }

      const pb = getPb(auth.token);
      const patientFromBody = normalizeString(body?.patientId);
      const patientNameFromBody = normalizeString(body?.patientName);
      const patientResolution = await resolvePatientIdForBulkPayment(
        pb,
        ownerFromToken,
        patientFromBody,
        patientNameFromBody,
      );

      if (!patientResolution.ok) {
        return new Response(
          JSON.stringify({ success: false, error: patientResolution.error }),
          { status: patientResolution.status },
        );
      }

      const resolvedPatientId = patientResolution.patientId;
      const escapedOwner = escapeFilterValue(ownerFromToken);
      const escapedPatientId = escapeFilterValue(resolvedPatientId);
      const escapedStart = escapeFilterValue(bounds.startIso);
      const escapedEnd = escapeFilterValue(bounds.endIso);
      const filter = `owner = "${escapedOwner}" && id_paciente = "${escapedPatientId}" && pago = false && data >= "${escapedStart}" && data < "${escapedEnd}"`;

      const sessionIds: string[] = [];
      let page = 1;

      while (true) {
        const list = await pb
          .collection(SESSAO_COLLECTION)
          .getList(page, MAX_BULK_UPDATE_PER_PAGE, { filter, sort: "+data" });

        for (const item of list.items) {
          if (typeof item.id === "string" && item.id.trim()) {
            sessionIds.push(item.id);
          }
        }

        if (page >= list.totalPages) break;
        page += 1;
      }

      await Promise.all(
        sessionIds.map((id) =>
          pb.collection(SESSAO_COLLECTION).update(id, { pago: true }),
        ),
      );

      return new Response(
        JSON.stringify({
          success: true,
          ownerId: ownerFromToken,
          patientId: resolvedPatientId,
          monthKey: normalizedMonthKey,
          updatedCount: sessionIds.length,
        }),
        { status: 200 },
      );
    } catch (error) {
      if (getErrorStatus(error) === 401) return unauthorizedResponse();
      console.error("sessoes bulk payment error", error);
      return new Response(
        JSON.stringify({ success: false, error: String(error) }),
        { status: 500 },
      );
    }
  }

  static async listPendingSessoesForPreview(
    request: Request,
    cookies: CookiesLike,
  ): Promise<Response> {
    try {
      const auth = getTokenOrUnauthorized(request, cookies);
      if (auth.response) return auth.response;
      if (!auth.token) return unauthorizedResponse();

      let body: {
        monthKey?: string;
        ownerId?: string;
        patientId?: string;
        patientName?: string;
      } | null = null;
      try {
        body = (await request.json()) as {
          monthKey?: string;
          ownerId?: string;
          patientId?: string;
          patientName?: string;
        };
      } catch {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid JSON payload" }),
          { status: 400 },
        );
      }

      const normalizedMonthKey = normalizeMonthKey(body?.monthKey);
      if (!normalizedMonthKey) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid monthKey" }),
          { status: 400 },
        );
      }

      const ownerFromToken = getOwnerIdFromToken(auth.token);
      if (!ownerFromToken) return unauthorizedResponse();

      const ownerFromBody = normalizeString(body?.ownerId);
      if (ownerFromBody && ownerFromBody !== ownerFromToken) {
        return new Response(
          JSON.stringify({ success: false, error: "Forbidden ownerId" }),
          { status: 403 },
        );
      }

      const bounds = getMonthBounds(normalizedMonthKey);
      if (!bounds) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid monthKey range" }),
          { status: 400 },
        );
      }

      const pb = getPb(auth.token);
      const patientFromBody = normalizeString(body?.patientId);
      const patientNameFromBody = normalizeString(body?.patientName);
      let resolvedPatientId: string | null = null;

      if (patientFromBody || patientNameFromBody) {
        const patientResolution = await resolvePatientIdForBulkPayment(
          pb,
          ownerFromToken,
          patientFromBody,
          patientNameFromBody,
        );

        if (!patientResolution.ok) {
          return new Response(
            JSON.stringify({
              success: true,
              ownerId: ownerFromToken,
              monthKey: normalizedMonthKey,
              items: [],
              totalItems: 0,
              totalValue: 0,
            }),
            { status: 200 },
          );
        }

        resolvedPatientId = patientResolution.patientId;
      }

      const escapedOwner = escapeFilterValue(ownerFromToken);
      const escapedStart = escapeFilterValue(bounds.startIso);
      const escapedEnd = escapeFilterValue(bounds.endIso);
      const baseFilter = `owner = "${escapedOwner}" && pago = false && data >= "${escapedStart}" && data < "${escapedEnd}"`;
      const filter = resolvedPatientId
        ? `${baseFilter} && id_paciente = "${escapeFilterValue(resolvedPatientId)}"`
        : baseFilter;

      const pendingItems: Array<{
        id: string;
        id_paciente: string;
        data: string;
        valor: number;
        pago: boolean;
      }> = [];
      let page = 1;

      while (true) {
        const list = await pb
          .collection(SESSAO_COLLECTION)
          .getList(page, MAX_BULK_UPDATE_PER_PAGE, { filter, sort: "+data" });

        for (const item of list.items) {
          if (
            typeof item.id === "string" &&
            item.id.trim() &&
            typeof item.id_paciente === "string" &&
            item.id_paciente.trim()
          ) {
            pendingItems.push({
              id: item.id,
              id_paciente: item.id_paciente,
              data: typeof item.data === "string" ? item.data : "",
              valor:
                typeof item.valor === "number"
                  ? item.valor
                  : Number(item.valor) || 0,
              pago: Boolean(item.pago),
            });
          }
        }

        if (page >= list.totalPages) break;
        page += 1;
      }

      const patientNameMap = await getPatientNamesMap(
        pb,
        pendingItems.map((item) => item.id_paciente),
      );

      const filteredByName = patientNameFromBody
        ? pendingItems.filter((item) => {
            const mappedName = patientNameMap.get(item.id_paciente) || "";
            return (
              normalizeTextForCompare(mappedName) ===
              normalizeTextForCompare(patientNameFromBody)
            );
          })
        : pendingItems;

      const previewItems = filteredByName.map((item) => ({
        ...item,
        pacienteNome: patientNameMap.get(item.id_paciente) || undefined,
      }));

      const totalValue = previewItems.reduce(
        (acc, item) => acc + (Number(item.valor) || 0),
        0,
      );

      return new Response(
        JSON.stringify({
          success: true,
          ownerId: ownerFromToken,
          patientId: resolvedPatientId || undefined,
          monthKey: normalizedMonthKey,
          totalItems: previewItems.length,
          totalValue,
          items: previewItems,
        }),
        { status: 200 },
      );
    } catch (error) {
      if (getErrorStatus(error) === 401) return unauthorizedResponse();
      console.error("sessoes preview error", error);
      return new Response(
        JSON.stringify({ success: false, error: String(error) }),
        { status: 500 },
      );
    }
  }

  static async paySingleSessaoFromPreview(
    request: Request,
    cookies: CookiesLike,
  ): Promise<Response> {
    try {
      const auth = getTokenOrUnauthorized(request, cookies);
      if (auth.response) return auth.response;
      if (!auth.token) return unauthorizedResponse();

      let body: {
        sessionId?: string;
        monthKey?: string;
        ownerId?: string;
        patientId?: string;
        patientName?: string;
      } | null = null;
      try {
        body = (await request.json()) as {
          sessionId?: string;
          monthKey?: string;
          ownerId?: string;
          patientId?: string;
          patientName?: string;
        };
      } catch {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid JSON payload" }),
          { status: 400 },
        );
      }

      const sessionId = normalizeString(body?.sessionId);
      if (!sessionId) {
        return new Response(
          JSON.stringify({ success: false, error: "sessionId is required" }),
          { status: 400 },
        );
      }

      const normalizedMonthKey = normalizeMonthKey(body?.monthKey);
      if (!normalizedMonthKey) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid monthKey" }),
          { status: 400 },
        );
      }

      const ownerFromToken = getOwnerIdFromToken(auth.token);
      if (!ownerFromToken) return unauthorizedResponse();

      const ownerFromBody = normalizeString(body?.ownerId);
      if (ownerFromBody && ownerFromBody !== ownerFromToken) {
        return new Response(
          JSON.stringify({ success: false, error: "Forbidden ownerId" }),
          { status: 403 },
        );
      }

      const bounds = getMonthBounds(normalizedMonthKey);
      if (!bounds) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid monthKey range" }),
          { status: 400 },
        );
      }

      const pb = getPb(auth.token);
      const session = await pb.collection(SESSAO_COLLECTION).getOne(sessionId);

      const sessionOwner =
        typeof session?.owner === "string" ? session.owner.trim() : "";
      if (!sessionOwner || sessionOwner !== ownerFromToken) {
        return new Response(
          JSON.stringify({ success: false, error: "Session owner mismatch" }),
          { status: 403 },
        );
      }

      if (!isDateInMonthRange(String(session?.data || ""), bounds)) {
        return new Response(
          JSON.stringify({ success: false, error: "Session month mismatch" }),
          { status: 409 },
        );
      }

      if (session?.pago) {
        return new Response(
          JSON.stringify({
            success: true,
            updated: false,
            reason: "already_paid",
          }),
          { status: 200 },
        );
      }

      const expectedPatientId = normalizeString(body?.patientId);
      const expectedPatientName = normalizeString(body?.patientName);
      if (!expectedPatientId && !expectedPatientName) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "patientId or patientName is required",
          }),
          { status: 400 },
        );
      }

      const sessionPatientId =
        typeof session?.id_paciente === "string"
          ? session.id_paciente.trim()
          : "";

      if (expectedPatientId && sessionPatientId !== expectedPatientId) {
        return new Response(
          JSON.stringify({ success: false, error: "Session patient mismatch" }),
          { status: 409 },
        );
      }

      if (!expectedPatientId && expectedPatientName) {
        try {
          const patient = await pb
            .collection(PACIENTE_COLLECTION)
            .getOne(sessionPatientId);
          const patientName =
            typeof patient?.nome === "string" ? patient.nome : "";
          if (
            normalizeTextForCompare(patientName) !==
            normalizeTextForCompare(expectedPatientName)
          ) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "Session patient mismatch",
              }),
              { status: 409 },
            );
          }
        } catch {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Patient not found for session",
            }),
            { status: 404 },
          );
        }
      }

      const updatedRecord = await pb
        .collection(SESSAO_COLLECTION)
        .update(sessionId, { pago: true });

      return new Response(
        JSON.stringify({
          success: true,
          updated: true,
          record: updatedRecord,
        }),
        { status: 200 },
      );
    } catch (error) {
      if (getErrorStatus(error) === 401) return unauthorizedResponse();
      console.error("sessoes pay single error", error);
      return new Response(
        JSON.stringify({ success: false, error: String(error) }),
        { status: 500 },
      );
    }
  }
}

export const sessaoService = SessaoService;
