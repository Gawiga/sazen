import type { APIRoute } from "astro";
import {
  deleteSessao,
  getSessaoById,
  updateSessao,
} from "../../../services/sessoesService";

export const GET: APIRoute = async ({ params, request, cookies }) => {
  return getSessaoById(params.id, request, cookies);
};

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  return updateSessao(params.id, request, cookies);
};

export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  return deleteSessao(params.id, request, cookies);
};
