import type { APIRoute } from "astro";
import { PacienteService } from "../../../services/pacienteService";

export const GET: APIRoute = async ({ params, request, cookies }) => {
  return PacienteService.getPacienteById(params.id, request, cookies);
};

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  return PacienteService.updatePaciente(params.id, request, cookies);
};

export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  return PacienteService.deletePaciente(params.id, request, cookies);
};
