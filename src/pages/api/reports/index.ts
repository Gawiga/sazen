import type { APIRoute } from "astro";
import PocketBase from "pocketbase";
import { getTokenFromRequest } from "../../../lib/jwt-helper";

const POCKETBASE_URL =
  import.meta.env.PUBLIC_POCKETBASE_URL ||
  "https://gawiga-server.bonito-dace.ts.net/";

function getPb(token?: string) {
  const pb = new PocketBase(POCKETBASE_URL);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (token) pb.authStore.save(token, {} as any);
  return pb;
}

function parsePagination(url: URL) {
  const pageRaw = Number.parseInt(url.searchParams.get("page") || "1", 10);
  const perPageRaw = Number.parseInt(
    url.searchParams.get("perPage") || "20",
    10,
  );

  return {
    page: Number.isNaN(pageRaw) ? 1 : Math.max(1, pageRaw),
    perPage: Number.isNaN(perPageRaw)
      ? 20
      : Math.max(1, Math.min(100, perPageRaw)),
  };
}

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const token = getTokenFromRequest(request, cookies);
    if (!token)
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401 },
      );
    const pb = getPb(token);

    const url = new URL(request.url);
    const collection = url.searchParams.get("collection");
    const { page, perPage } = parsePagination(url);

    if (collection) {
      // Return a paginated list for the requested collection
      const list = await pb.collection(collection).getList(page, perPage);
      return new Response(JSON.stringify({ success: true, ...list }), {
        status: 200,
      });
    }

    // Backwards-compatible: return first page for both collections
    const fatur = await pb.collection("faturamento_mensal").getList(1, perPage);
    const receber = await pb.collection("valores_receber").getList(1, perPage);
    return new Response(JSON.stringify({ success: true, fatur, receber }), {
      status: 200,
    });
  } catch (err) {
    console.error("reports GET error", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500 },
    );
  }
};
