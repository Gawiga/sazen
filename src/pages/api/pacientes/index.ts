import type { APIRoute } from "astro";
import {
  createPaciente,
  listPacientes,
} from "../../../services/pacientesService";

export const GET: APIRoute = async ({ request, cookies }) => {
  return listPacientes(request, cookies);
};

export const POST: APIRoute = async ({ request, cookies }) => {
  return createPaciente(request, cookies);
};
