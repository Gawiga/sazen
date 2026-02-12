import type { APIRoute } from 'astro';

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

    // In a real implementation, you would validate the token with PocketBase
    // For now, we're just checking if the token exists
    // You can decode the JWT or make a request to PocketBase to validate

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          token: token,
          // Additional user info would be decoded from the JWT or fetched from PocketBase
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user info',
      }),
      { status: 500 }
    );
  }
};
