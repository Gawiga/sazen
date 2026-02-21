import type { APIRoute } from "astro";
import { createSessao, listSessoes } from "../../../services/sessoesService";

export const GET: APIRoute = async ({ request, cookies }) => {
  return listSessoes(request, cookies);
};

export const POST: APIRoute = async ({ request, cookies }) => {
  return createSessao(request, cookies);
};
