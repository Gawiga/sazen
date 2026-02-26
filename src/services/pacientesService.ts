import PocketBase from "pocketbase";
import { decodeJwt, getTokenFromRequest } from "../lib/jwt-helper";

const POCKETBASE_URL =
  import.meta.env.PUBLIC_POCKETBASE_URL ||
  "https://gawiga-server.bonito-dace.ts.net/";
const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 20;
const MIN_PER_PAGE = 1;
const MAX_PER_PAGE = 100;
const EMPTY_RECORD_MODEL = { collectionId: "", collectionName: "", id: "" };
type CookiesLike = {
  get?: (name: string) => { value: string } | undefined | null;
};

function getPb(token?: string) {
  const pb = new PocketBase(POCKETBASE_URL);

  if (token) pb.authStore.save(token, EMPTY_RECORD_MODEL);
  return pb;
}

function getTokenOrUnauthorized(
  request: Request,
  cookies: CookiesLike,
): { token?: string; response?: Response } {
  const token = getTokenFromRequest(request, cookies);
  if (!token) {
    return {
      response: new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401 },
      ),
    };
  }

  return { token };
}

function getOwnerIdFromToken(token: string): string | null {
  const decoded = decodeJwt(token);
  if (!decoded.valid) return null;

  const userId = decoded.payload.id;
  return typeof userId === "string" && userId.length > 0 ? userId : null;
}

function parsePagination(url: URL) {
  const page = Number.parseInt(url.searchParams.get("page") || "1", 10);
  const perPage = Number.parseInt(
    url.searchParams.get("perPage") || String(DEFAULT_PER_PAGE),
    10,
  );

  return {
    page: Number.isNaN(page) ? DEFAULT_PAGE : Math.max(DEFAULT_PAGE, page),
    perPage: Number.isNaN(perPage)
      ? DEFAULT_PER_PAGE
      : Math.max(MIN_PER_PAGE, Math.min(MAX_PER_PAGE, perPage)),
  };
}

function parseStatusFilter(url: URL): "ativo" | "inativo" | "todos" {
  const status = (url.searchParams.get("status") || "ativo").toLowerCase();
  if (status === "inativo") return "inativo";
  if (status === "todos") return "todos";
  return "ativo";
}

export async function listPacientes(
  request: Request,
  cookies: CookiesLike,
): Promise<Response> {
  try {
    const auth = getTokenOrUnauthorized(request, cookies);
    if (auth.response) return auth.response;

    const url = new URL(request.url);
    const { page, perPage } = parsePagination(url);
    const status = parseStatusFilter(url);
    const filter =
      status === "todos"
        ? undefined
        : status === "ativo"
          ? "ativo = true"
          : "ativo = false";
    const pb = getPb(auth.token);
    const list = await pb.collection("paciente").getList(page, perPage, {
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
  } catch (err) {
    console.error("pacientes GET error", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500 },
    );
  }
}

export async function createPaciente(
  request: Request,
  cookies: CookiesLike,
): Promise<Response> {
  try {
    const auth = getTokenOrUnauthorized(request, cookies);
    if (auth.response) return auth.response;

    const { token } = auth;
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401 },
      );
    }

    const pb = getPb(token);
    const payload = await request.json();
    const owner = getOwnerIdFromToken(token);
    if (owner) payload.owner = owner;

    const record = await pb.collection("paciente").create(payload);
    return new Response(JSON.stringify({ success: true, record }), {
      status: 201,
    });
  } catch (err) {
    console.error("pacientes POST error", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 400 },
    );
  }
}

export async function getPacienteById(
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
    const record = await pb.collection("paciente").getOne(id);
    return new Response(JSON.stringify({ success: true, record }), {
      status: 200,
    });
  } catch (err) {
    console.error("paciente GET error", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 404 },
    );
  }
}

export async function updatePaciente(
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
    const record = await pb.collection("paciente").update(id, payload);

    return new Response(JSON.stringify({ success: true, record }), {
      status: 200,
    });
  } catch (err) {
    console.error("paciente PUT error", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 400 },
    );
  }
}

export async function deletePaciente(
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
    await pb.collection("paciente").delete(id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("paciente DELETE error", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 400 },
    );
  }
}

export const pacientesService = {
  listPacientes,
  createPaciente,
  getPacienteById,
  updatePaciente,
  deletePaciente,
};
