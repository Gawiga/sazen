import type { APIRoute } from "astro";
import PocketBase from "pocketbase";

const POCKETBASE_URL =
  import.meta.env.PUBLIC_POCKETBASE_URL ||
  "https://gawiga-server.bonito-dace.ts.net/";
const POCKETBASE_COLLECTION =
  import.meta.env.PUBLIC_POCKETBASE_COLLECTION || "users";

export const POST: APIRoute = async ({ request, cookies }) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
        status: 400,
      });
    }

    const { email, password } = (body ?? {}) as {
      email?: unknown;
      password?: unknown;
    };

    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedPassword = typeof password === "string" ? password : "";

    if (!normalizedEmail || !normalizedPassword) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400 },
      );
    }

    if (normalizedEmail.length > 254 || normalizedPassword.length > 256) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 400,
      });
    }

    const pb = new PocketBase(POCKETBASE_URL);

    // Authenticate with PocketBase
    await pb
      .collection(POCKETBASE_COLLECTION)
      .authWithPassword(normalizedEmail, normalizedPassword);

    // Store token in HTTP-only cookie. Use secure cookies only in production (localhost won't accept secure cookies).
    cookies.set("pb_auth", pb.authStore.token, {
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
        record: pb.authStore.record,
      }),
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error(
      "Login error:",
      error instanceof Error ? error.message : error,
    );
    return new Response(
      JSON.stringify({
        success: false,
        error: "Invalid credentials",
      }),
      {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
};
