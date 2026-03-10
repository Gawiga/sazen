import type { APIRoute } from "astro";
import { AuthService } from "~/services/authService";

export const POST: APIRoute = async ({ cookies }) => {
  return AuthService.logout(cookies);
};
