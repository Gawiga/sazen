import type { APIRoute } from "astro";
import { SessaoService } from "../../../services/sessaoService";

export const GET: APIRoute = async ({ params, request, cookies }) => {
  return SessaoService.getSessaoById(params.id, request, cookies);
};

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  return SessaoService.updateSessao(params.id, request, cookies);
};

export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  return SessaoService.deleteSessao(params.id, request, cookies);
};
