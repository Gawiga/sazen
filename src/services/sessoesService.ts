import PocketBase from "pocketbase";
import { decodeJwt, getTokenFromRequest } from "../lib/jwt-helper";

const POCKETBASE_URL =
  import.meta.env.PUBLIC_POCKETBASE_URL ||
  "https://gawiga-server.bonito-dace.ts.net/";

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;
const MIN_PER_PAGE = 1;
const MAX_PER_PAGE = 100;

function getPb(token?: string) {
  const pb = new PocketBase(POCKETBASE_URL);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (token) pb.authStore.save(token, {} as any);
  return pb;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTokenOrUnauthorized(
  request: Request,
  cookies: any,
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

function getOwnerIdFromToken(token: string): string | null {
  const decoded = decodeJwt(token);
  if (!decoded.valid) return null;

  const userId = decoded.payload.id;
  return typeof userId === "string" && userId.length > 0 ? userId : null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function listSessoes(
  request: Request,
  cookies: any,
): Promise<Response> {
  try {
    const auth = getTokenOrUnauthorized(request, cookies);
    if (auth.response) return auth.response;

    const { page, perPage } = parsePagination(new URL(request.url));
    const sort = new URL(request.url).searchParams.get("sort") || "-data";
    const pb = getPb(auth.token);
    const list = await pb.collection("sessao").getList(page, perPage, { sort });

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
    console.error("sessoes GET error", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500 },
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createSessao(
  request: Request,
  cookies: any,
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

    if (owner) {
      payload.owner = owner;
    }

    const record = await pb.collection("sessao").create(payload);
    return new Response(JSON.stringify({ success: true, record }), {
      status: 201,
    });
  } catch (err) {
    console.error("sessoes POST error", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 400 },
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getSessaoById(
  id: string | undefined,
  request: Request,
  cookies: any,
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
    const record = await pb.collection("sessao").getOne(id);
    return new Response(JSON.stringify({ success: true, record }), {
      status: 200,
    });
  } catch (err) {
    console.error("sessao GET error", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 404 },
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateSessao(
  id: string | undefined,
  request: Request,
  cookies: any,
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
    const record = await pb.collection("sessao").update(id, payload);

    return new Response(JSON.stringify({ success: true, record }), {
      status: 200,
    });
  } catch (err) {
    console.error("sessao PUT error", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 400 },
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function deleteSessao(
  id: string | undefined,
  request: Request,
  cookies: any,
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
    await pb.collection("sessao").delete(id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("sessao DELETE error", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 400 },
    );
  }
}

export const sessoesService = {
  listSessoes,
  createSessao,
  getSessaoById,
  updateSessao,
  deleteSessao,
};
