import type { APIRoute } from "astro";
import PocketBase from "pocketbase";
import { getTokenFromRequest } from "../../../lib/jwt-helper";

const POCKETBASE_URL =
  import.meta.env.PUBLIC_POCKETBASE_URL ||
  "https://gawiga-server.bonito-dace.ts.net/";
const POCKETBASE_COLLECTION =
  import.meta.env.PUBLIC_POCKETBASE_COLLECTION || "users";

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const token = getTokenFromRequest(request, cookies);

    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          user: null,
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    const pb = new PocketBase(POCKETBASE_URL);
    pb.authStore.save(token);

    const authData = await pb.collection(POCKETBASE_COLLECTION).authRefresh();
    const refreshedToken = pb.authStore.token;
    const userRecord = authData.record || pb.authStore.record;

    if (!refreshedToken || !userRecord) {
      return new Response(
        JSON.stringify({
          success: false,
          user: null,
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    cookies.set("pb_auth", refreshedToken, {
      httpOnly: true,
      secure: import.meta.env.PROD === true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userRecord.id,
          email:
            typeof userRecord.email === "string" ? userRecord.email : undefined,
          name:
            typeof userRecord.name === "string" ? userRecord.name : undefined,
          username:
            typeof userRecord.username === "string"
              ? userRecord.username
              : undefined,
        },
      }),
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error(
      "Get user error:",
      error instanceof Error ? error.message : error,
    );
    cookies.delete("pb_auth", { path: "/" });
    return new Response(
      JSON.stringify({
        success: false,
        user: null,
        error: "Unauthorized",
      }),
      {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
};
