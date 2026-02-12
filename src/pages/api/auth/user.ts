import type { APIRoute } from 'astro';
import PocketBase from 'pocketbase';

const POCKETBASE_URL = import.meta.env.PUBLIC_POCKETBASE_URL || 'https://gawiga-server.bonito-dace.ts.net/';

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const token = cookies.get('pb_auth')?.value;

    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          user: null,
        }),
        { status: 401 }
      );
    }

    // Best-effort validation: set token in PocketBase client and perform a simple request.
    // If the token is invalid the request should fail (401) and we return unauthorized.
    const pb = new PocketBase(POCKETBASE_URL);
    pb.authStore.save(token, {});

    try {
      // Try a lightweight request — listing 1 user. This requires that token grants permission
      // to at least access the users collection or will error; it's a reasonable runtime check.
      await pb.collection('users').getList(1, 1);
    } catch (err) {
      // If this fails, treat as unauthorized (token invalid/expired)
      return new Response(
        JSON.stringify({ success: false, user: null, error: 'Invalid token' }),
        { status: 401 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, user: { token } }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Failed to get user info' }),
      { status: 500 }
    );
  }
};
