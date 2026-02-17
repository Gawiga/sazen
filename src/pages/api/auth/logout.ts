import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ cookies }) => {
  try {
    // Clear the authentication cookie (match options used when setting it)
    cookies.delete("pb_auth", {
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
      { status: 200 },
    );
  } catch (error) {
    console.error("Logout error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Logout failed",
      }),
      { status: 500 },
    );
  }
};
