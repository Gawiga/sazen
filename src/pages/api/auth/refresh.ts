import type { APIRoute } from "astro";
import PocketBase from "pocketbase";
import { decodeJwt } from "~/lib/jwt-helper";

const POCKETBASE_URL =
  import.meta.env.PUBLIC_POCKETBASE_URL ||
  "https://gawiga-server.bonito-dace.ts.net/";

export const POST: APIRoute = async ({ cookies }) => {
  try {
    // Try to get token from cookie
    const authCookie = cookies.get("pb_auth");
    const token = authCookie?.value;

    if (!token) {
      return new Response(JSON.stringify({ error: "No token found" }), {
        status: 401,
      });
    }

    // Validate current token
    const { valid } = decodeJwt(token);
    if (!valid) {
      cookies.delete("pb_auth", { path: "/" });
      return new Response(JSON.stringify({ error: "Token expired" }), {
        status: 401,
      });
    }

    // Try to refresh the token using PocketBase
    const pb = new PocketBase(POCKETBASE_URL);
    pb.authStore.save(token); // Restore the token

    try {
      // PocketBase refresh method would go here
      // For now, return the existing token as it's still valid
      // In production, implement token refresh if PocketBase supports it

      // Update cookie with new expiration
      cookies.set("pb_auth", token, {
        httpOnly: true,
        secure: import.meta.env.PROD === true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return new Response(
        JSON.stringify({
          success: true,
          token: pb.authStore.token,
        }),
        { status: 200 },
      );
    } catch (error) {
      console.error("Refresh error:", error);
      cookies.delete("pb_auth", { path: "/" });
      return new Response(JSON.stringify({ error: "Token refresh failed" }), {
        status: 401,
      });
    }
  } catch (error) {
    console.error("Refresh endpoint error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Refresh failed",
      }),
      { status: 500 },
    );
  }
};
