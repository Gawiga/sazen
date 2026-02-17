// Simple JWT validation helper for PocketBase tokens
// Decodes and validates JWT structure without needing external libraries

export function decodeJwt(token: string): {
  payload: Record<string, unknown>;
  valid: boolean;
} {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { payload: {}, valid: false };

    // Decode payload (second part)
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8"),
    );

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { payload, valid: false };
    }

    return { payload, valid: true };
  } catch {
    return { payload: {}, valid: false };
  }
}

export function getTokenFromRequest(
  request?: Request,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cookies?: any,
): string | null {
  // Try Authorization header first
  if (request) {
    const auth = request.headers.get("Authorization");
    if (auth?.startsWith("Bearer ")) {
      return auth.slice(7);
    }
  }

  // Fall back to cookie
  if (cookies) {
    return cookies.get("pb_auth")?.value || null;
  }

  return null;
}
