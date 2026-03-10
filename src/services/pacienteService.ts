import { PatientService } from "./patientService";
import {
  createPaciente,
  deletePaciente,
  getPacienteById,
  listPacientes,
  updatePaciente,
} from "./pacientesService";

export class PacienteService extends PatientService {
  static async listPacientes(
    request: Request,
    cookies: Parameters<typeof listPacientes>[1],
  ): Promise<Response> {
    return listPacientes(request, cookies);
  }

  static async createPaciente(
    request: Request,
    cookies: Parameters<typeof createPaciente>[1],
  ): Promise<Response> {
    return createPaciente(request, cookies);
  }

  static async getPacienteById(
    id: string | undefined,
    request: Request,
    cookies: Parameters<typeof getPacienteById>[2],
  ): Promise<Response> {
    return getPacienteById(id, request, cookies);
  }

  static async updatePaciente(
    id: string | undefined,
    request: Request,
    cookies: Parameters<typeof updatePaciente>[2],
  ): Promise<Response> {
    return updatePaciente(id, request, cookies);
  }

  static async deletePaciente(
    id: string | undefined,
    request: Request,
    cookies: Parameters<typeof deletePaciente>[2],
  ): Promise<Response> {
    return deletePaciente(id, request, cookies);
  }
}

export const pacienteService = PacienteService;
