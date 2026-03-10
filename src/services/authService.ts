import { getTokenFromRequest } from "~/lib/jwt-helper";
import type {
  AuthLoginPayload,
  AuthSignupPayload,
  AuthUser,
} from "~/types/auth";
import { getPb } from "./sharedService";

const AUTH_COOKIE_NAME = "pb_auth";
const POCKETBASE_COLLECTION =
  import.meta.env.PUBLIC_POCKETBASE_COLLECTION || "users";

type CookieStore = {
  get: (name: string) => { value: string } | undefined;
  set: (
    name: string,
    value: string,
    options: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: "lax";
      path: string;
      maxAge?: number;
    },
  ) => void;
  delete: (
    name: string,
    options: {
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: "lax";
      path: string;
    },
  ) => void;
};

function buildAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: import.meta.env.PROD === true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

function buildNoStoreHeaders() {
  return {
    "Cache-Control": "no-store",
  };
}

function unauthorizedResponse() {
  return new Response(
    JSON.stringify({
      success: false,
      user: null,
      error: "Unauthorized",
    }),
    {
      status: 401,
      headers: buildNoStoreHeaders(),
    },
  );
}

async function parseJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

function normalizeLoginPayload(payload: AuthLoginPayload | null): {
  email: string;
  password: string;
} {
  const email =
    typeof payload?.email === "string"
      ? payload.email.trim().toLowerCase()
      : "";
  const password =
    typeof payload?.password === "string" ? payload.password : "";
  return { email, password };
}

function sanitizeUserRecord(record: Record<string, unknown>): AuthUser {
  return {
    id: typeof record.id === "string" ? record.id : "",
    email: typeof record.email === "string" ? record.email : undefined,
    name: typeof record.name === "string" ? record.name : undefined,
    username: typeof record.username === "string" ? record.username : undefined,
  };
}

export class AuthService {
  static async login(
    request: Request,
    cookies: CookieStore,
  ): Promise<Response> {
    const payload = await parseJsonBody<AuthLoginPayload>(request);
    if (!payload) {
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
        status: 400,
      });
    }

    const { email, password } = normalizeLoginPayload(payload);
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400 },
      );
    }

    if (email.length > 254 || password.length > 256) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 400,
      });
    }

    try {
      const pb = getPb(undefined, { useEmptyRecordModel: true });
      await pb
        .collection(POCKETBASE_COLLECTION)
        .authWithPassword(email, password);
      const token = pb.authStore.token;
      const record = pb.authStore.record;

      if (!token) {
        throw new Error("Missing token after authWithPassword");
      }

      cookies.set(AUTH_COOKIE_NAME, token, buildAuthCookieOptions());

      return new Response(
        JSON.stringify({
          success: true,
          token,
          record,
        }),
        {
          status: 200,
          headers: buildNoStoreHeaders(),
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
          headers: buildNoStoreHeaders(),
        },
      );
    }
  }

  static async signup(
    request: Request,
    cookies: CookieStore,
  ): Promise<Response> {
    const payload = await parseJsonBody<AuthSignupPayload>(request);
    if (!payload) {
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
        status: 400,
      });
    }

    const { email, password, passwordConfirm, name, emailVisibility } = payload;

    if (!email || !password || !passwordConfirm) {
      return new Response(
        JSON.stringify({
          error: "Email, password, and password confirmation are required",
        }),
        { status: 400 },
      );
    }

    if (password !== passwordConfirm) {
      return new Response(JSON.stringify({ error: "Passwords do not match" }), {
        status: 400,
      });
    }

    try {
      const pb = getPb(undefined, { useEmptyRecordModel: true });
      const createData: Record<string, unknown> = {
        email,
        password,
        passwordConfirm,
      };

      if (typeof name === "string" && name.trim()) {
        createData.name = name.trim();
      }
      if (typeof emailVisibility === "boolean") {
        createData.emailVisibility = emailVisibility;
      }

      const record = await pb
        .collection(POCKETBASE_COLLECTION)
        .create(createData);

      try {
        await pb.collection(POCKETBASE_COLLECTION).requestVerification(email);
      } catch (verificationError) {
        console.warn(
          "Verification request failed (non-fatal):",
          verificationError,
        );
      }

      await pb
        .collection(POCKETBASE_COLLECTION)
        .authWithPassword(email, password);

      cookies.set(
        AUTH_COOKIE_NAME,
        pb.authStore.token,
        buildAuthCookieOptions(),
      );

      return new Response(
        JSON.stringify({
          success: true,
          token: pb.authStore.token,
          record,
        }),
        {
          status: 201,
          headers: buildNoStoreHeaders(),
        },
      );
    } catch (error) {
      console.error("Signup error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : "Signup failed",
        }),
        { status: 400, headers: buildNoStoreHeaders() },
      );
    }
  }

  static logout(cookies: CookieStore): Response {
    try {
      cookies.delete(AUTH_COOKIE_NAME, {
        httpOnly: true,
        secure: import.meta.env.PROD === true,
        sameSite: "lax",
        path: "/",
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Logged out successfully",
        }),
        {
          status: 200,
          headers: buildNoStoreHeaders(),
        },
      );
    } catch (error) {
      console.error("Logout error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : "Logout failed",
        }),
        {
          status: 500,
          headers: buildNoStoreHeaders(),
        },
      );
    }
  }

  static async refresh(
    request: Request,
    cookies: CookieStore,
  ): Promise<Response> {
    const token = getTokenFromRequest(request, cookies);
    if (!token) {
      return new Response(JSON.stringify({ error: "No token found" }), {
        status: 401,
        headers: buildNoStoreHeaders(),
      });
    }

    try {
      const pb = getPb(undefined, { useEmptyRecordModel: true });
      pb.authStore.save(token);
      await pb.collection(POCKETBASE_COLLECTION).authRefresh();

      const refreshedToken = pb.authStore.token;
      if (!refreshedToken) {
        throw new Error("Token refresh failed");
      }

      cookies.set(AUTH_COOKIE_NAME, refreshedToken, buildAuthCookieOptions());

      return new Response(
        JSON.stringify({
          success: true,
          token: refreshedToken,
        }),
        {
          status: 200,
          headers: buildNoStoreHeaders(),
        },
      );
    } catch (error) {
      console.error("Refresh error:", error);
      cookies.delete(AUTH_COOKIE_NAME, { path: "/" });
      return new Response(JSON.stringify({ error: "Token refresh failed" }), {
        status: 401,
        headers: buildNoStoreHeaders(),
      });
    }
  }

  static async getUser(
    request: Request,
    cookies: CookieStore,
  ): Promise<Response> {
    const token = getTokenFromRequest(request, cookies);
    if (!token) {
      return unauthorizedResponse();
    }

    try {
      const pb = getPb(undefined, { useEmptyRecordModel: true });
      pb.authStore.save(token);

      const authData = await pb.collection(POCKETBASE_COLLECTION).authRefresh();
      const refreshedToken = pb.authStore.token;
      const record = authData.record || pb.authStore.record;

      if (!refreshedToken || !record) {
        cookies.delete(AUTH_COOKIE_NAME, { path: "/" });
        return unauthorizedResponse();
      }

      cookies.set(AUTH_COOKIE_NAME, refreshedToken, buildAuthCookieOptions());

      return new Response(
        JSON.stringify({
          success: true,
          user: sanitizeUserRecord(record as Record<string, unknown>),
        }),
        {
          status: 200,
          headers: buildNoStoreHeaders(),
        },
      );
    } catch (error) {
      console.error(
        "Get user error:",
        error instanceof Error ? error.message : error,
      );
      cookies.delete(AUTH_COOKIE_NAME, { path: "/" });
      return unauthorizedResponse();
    }
  }
}

export const authService = AuthService;
