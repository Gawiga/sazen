import type { APIRoute } from "astro";
import { AuthService } from "~/services/authService";

export const POST: APIRoute = async ({ request, cookies }) => {
  return AuthService.refresh(request, cookies);
};
