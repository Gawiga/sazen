import type { APIRoute } from "astro";
import { PacienteService } from "../../../services/pacienteService";

export const GET: APIRoute = async ({ request, cookies }) => {
  return PacienteService.listPacientes(request, cookies);
};

export const POST: APIRoute = async ({ request, cookies }) => {
  return PacienteService.createPaciente(request, cookies);
};
