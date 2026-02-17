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
    const payload = await request.json();
    const { email, password, passwordConfirm, name, emailVisibility } =
      payload as {
        email?: string;
        password?: string;
        passwordConfirm?: string;
        name?: string;
        emailVisibility?: boolean;
      };

    if (!email || !password || !passwordConfirm) {
      return new Response(
        JSON.stringify({
          error: "Email, password, and password confirmation are required",
        }),
        {
          status: 400,
        },
      );
    }

    if (password !== passwordConfirm) {
      return new Response(JSON.stringify({ error: "Passwords do not match" }), {
        status: 400,
      });
    }

    const pb = new PocketBase(POCKETBASE_URL);

    try {
      // Build create payload according to PocketBase auth requirements
      const createData: Record<string, unknown> = {
        email,
        password,
        passwordConfirm,
      };

      if (typeof name === "string" && name.length > 0) createData.name = name;
      if (typeof emailVisibility === "boolean")
        createData.emailVisibility = emailVisibility;

      // Create new user (auth record)
      const record = await pb
        .collection(POCKETBASE_COLLECTION)
        .create(createData);

      // (optional) request email verification — ignore errors from this call
      try {
        if (email)
          await pb.collection(POCKETBASE_COLLECTION).requestVerification(email);
      } catch (err) {
        console.warn("Verification request failed (non-fatal):", err);
      }

      // Authenticate the newly created user
      await pb
        .collection(POCKETBASE_COLLECTION)
        .authWithPassword(email!, password!);

      // Store token in HTTP-only cookie. Use secure cookies only in production.
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
          record: record,
        }),
        { status: 201 },
      );
    } catch (error) {
      console.error("Account creation error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create account";
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
        }),
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Signup error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Signup failed",
      }),
      { status: 500 },
    );
  }
};
