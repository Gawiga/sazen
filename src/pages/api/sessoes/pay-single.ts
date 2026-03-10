import type { APIRoute } from "astro";
import { SessaoService } from "../../../services/sessaoService";

export const POST: APIRoute = async ({ request, cookies }) => {
  return SessaoService.paySingleSessaoFromPreview(request, cookies);
};
