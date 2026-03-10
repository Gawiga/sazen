import { UIService } from "./uiService";
import type { Paciente } from "~/types/paciente";
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

const PACIENTE_COLLECTION = "paciente";

function parseStatusFilter(url: URL): "ativo" | "inativo" | "todos" {
  const status = (url.searchParams.get("status") || "ativo").toLowerCase();
  if (status === "inativo") return "inativo";
  if (status === "todos") return "todos";
  return "ativo";
}

function getStatusFilter(status: "ativo" | "inativo" | "todos") {
  if (status === "todos") return undefined;
  return status === "ativo" ? "ativo = true" : "ativo = false";
}

export class PacienteService {
  // Client-side methods
  static async getPatients(
    page: number,
    perPage: number,
    status: "ativo" | "inativo" | "todos" = "ativo",
  ): Promise<PaginatedResponse<Paciente>> {
    const url = `/api/pacientes?page=${page}&perPage=${perPage}&status=${status}`;
    return UIService.get<PaginatedResponse<Paciente>>(url);
  }

  static async createPatient(payload: Partial<Paciente>): Promise<Paciente> {
    return UIService.post<Paciente>("/api/pacientes", payload);
  }

  static async updatePatient(
    id: string,
    payload: Partial<Paciente>,
  ): Promise<Paciente> {
    return UIService.put<Paciente>(`/api/pacientes/${id}`, payload);
  }

  static async deletePatient(id: string): Promise<void> {
    await UIService.delete(`/api/pacientes/${id}`);
  }

  static async getPatient(id: string): Promise<Paciente> {
    return UIService.get<Paciente>(`/api/pacientes/${id}`);
  }

  // Server-side methods
  static async listPacientes(
    request: Request,
    cookies: CookiesLike,
  ): Promise<Response> {
    try {
      const auth = getTokenOrUnauthorized(request, cookies);
      if (auth.response) return auth.response;

      const url = new URL(request.url);
      const { page, perPage } = parsePagination(url);
      const status = parseStatusFilter(url);
      const filter = getStatusFilter(status);

      const pb = getPb(auth.token, { useEmptyRecordModel: true });
      const list = await pb
        .collection(PACIENTE_COLLECTION)
        .getList(page, perPage, {
          sort: "-created",
          ...(filter ? { filter } : {}),
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
      console.error("pacientes GET error", error);
      return new Response(
        JSON.stringify({ success: false, error: String(error) }),
        { status: 500 },
      );
    }
  }

  static async createPaciente(
    request: Request,
    cookies: CookiesLike,
  ): Promise<Response> {
    try {
      const auth = getTokenOrUnauthorized(request, cookies);
      if (auth.response) return auth.response;
      if (!auth.token) return unauthorizedResponse();

      const pb = getPb(auth.token, { useEmptyRecordModel: true });
      const payload = await request.json();
      const owner = getOwnerIdFromToken(auth.token);
      if (owner) payload.owner = owner;

      const record = await pb.collection(PACIENTE_COLLECTION).create(payload);
      return new Response(JSON.stringify({ success: true, record }), {
        status: 201,
      });
    } catch (error) {
      if (getErrorStatus(error) === 401) return unauthorizedResponse();
      console.error("pacientes POST error", error);
      return new Response(
        JSON.stringify({ success: false, error: String(error) }),
        { status: 400 },
      );
    }
  }

  static async getPacienteById(
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

      const pb = getPb(auth.token, { useEmptyRecordModel: true });
      const record = await pb.collection(PACIENTE_COLLECTION).getOne(id);
      return new Response(JSON.stringify({ success: true, record }), {
        status: 200,
      });
    } catch (error) {
      if (getErrorStatus(error) === 401) return unauthorizedResponse();
      console.error("paciente GET error", error);
      return new Response(
        JSON.stringify({ success: false, error: String(error) }),
        { status: 404 },
      );
    }
  }

  static async updatePaciente(
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
      const pb = getPb(auth.token, { useEmptyRecordModel: true });
      const record = await pb
        .collection(PACIENTE_COLLECTION)
        .update(id, payload);

      return new Response(JSON.stringify({ success: true, record }), {
        status: 200,
      });
    } catch (error) {
      if (getErrorStatus(error) === 401) return unauthorizedResponse();
      console.error("paciente PUT error", error);
      return new Response(
        JSON.stringify({ success: false, error: String(error) }),
        { status: 400 },
      );
    }
  }

  static async deletePaciente(
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

      const pb = getPb(auth.token, { useEmptyRecordModel: true });
      await pb.collection(PACIENTE_COLLECTION).delete(id);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
      if (getErrorStatus(error) === 401) return unauthorizedResponse();
      console.error("paciente DELETE error", error);
      return new Response(
        JSON.stringify({ success: false, error: String(error) }),
        { status: 400 },
      );
    }
  }
}

export const pacienteService = PacienteService;
