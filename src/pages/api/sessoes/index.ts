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

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const token = getTokenFromRequest(request, cookies);
    if (!token)
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401 },
      );
    const pb = getPb(token);
    const list = await pb.collection("sessao").getFullList({ sort: "-data" });
    return new Response(JSON.stringify({ success: true, items: list }), {
      status: 200,
    });
  } catch (err) {
    console.error("sessoes GET error", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500 },
    );
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = getTokenFromRequest(request, cookies);
    if (!token)
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401 },
      );
    const pb = getPb(token);
    const payload = await request.json();
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
};
