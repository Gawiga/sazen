import type { APIRoute } from "astro";
import {
  deletePaciente,
  getPacienteById,
  updatePaciente,
} from "../../../services/pacientesService";

export const GET: APIRoute = async ({ params, request, cookies }) => {
  return getPacienteById(params.id, request, cookies);
};

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  return updatePaciente(params.id, request, cookies);
};

export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  return deletePaciente(params.id, request, cookies);
};
