import type { APIRoute } from "astro";
import { decodeJwt, getTokenFromRequest } from "../../../lib/jwt-helper";

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const token = getTokenFromRequest(request, cookies);

    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          user: null,
        }),
        { status: 401 },
      );
    }

    // Lightweight validation: just decode and check expiration
    const { payload, valid } = decodeJwt(token);

    if (!valid) {
      return new Response(
        JSON.stringify({
          success: false,
          user: null,
          error: "Invalid or expired token",
        }),
        {
          status: 401,
        },
      );
    }

    return new Response(
      JSON.stringify({ success: true, user: { token, payload } }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Get user error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get user info",
      }),
      { status: 500 },
    );
  }
};
