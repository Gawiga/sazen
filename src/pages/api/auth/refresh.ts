import type { APIRoute } from "astro";
import PocketBase from "pocketbase";

const POCKETBASE_URL =
  import.meta.env.PUBLIC_POCKETBASE_URL ||
  "https://gawiga-server.bonito-dace.ts.net/";
const POCKETBASE_COLLECTION =
  import.meta.env.PUBLIC_POCKETBASE_COLLECTION || "users";

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

    // Validate and refresh token using PocketBase backend.
    const pb = new PocketBase(POCKETBASE_URL);
    pb.authStore.save(token);

    try {
      await pb.collection(POCKETBASE_COLLECTION).authRefresh();
      const refreshedToken = pb.authStore.token;

      if (!refreshedToken) {
        throw new Error("Token refresh failed");
      }

      // Update cookie with new expiration
      cookies.set("pb_auth", refreshedToken, {
        httpOnly: true,
        secure: import.meta.env.PROD === true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return new Response(
        JSON.stringify({
          success: true,
          token: refreshedToken,
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
