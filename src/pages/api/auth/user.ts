import type { APIRoute } from "astro";
import { AuthService } from "~/services/authService";

export const GET: APIRoute = async ({ request, cookies }) => {
  return AuthService.getUser(request, cookies);
};
