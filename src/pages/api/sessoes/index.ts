import type { APIRoute } from "astro";
import { SessaoService } from "../../../services/sessaoService";

export const GET: APIRoute = async ({ request, cookies }) => {
  return SessaoService.listSessoes(request, cookies);
};

export const POST: APIRoute = async ({ request, cookies }) => {
  return SessaoService.createSessao(request, cookies);
};
