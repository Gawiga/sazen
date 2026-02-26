// Serviço específico para operações com pacientes
import { UIService } from "./uiService";
import type { Paciente, PaginatedResponse } from "~/types/api";

export class PatientService {
  static async getPatients(
    page: number,
    perPage: number,
    status: "ativo" | "inativo" | "todos" = "ativo",
  ): Promise<PaginatedResponse<Paciente>> {
    const url = `/api/pacientes?page=${page}&perPage=${perPage}&status=${status}`;
    return UIService.get<PaginatedResponse<Paciente>>(url);
  }

  static async createPatient(payload: Partial<Paciente>): Promise<Paciente> {
    return UIService.post<Paciente>("/api/pacientes", payload);
  }

  static async updatePatient(
    id: string,
    payload: Partial<Paciente>,
  ): Promise<Paciente> {
    return UIService.put<Paciente>(`/api/pacientes/${id}`, payload);
  }

  static async deletePatient(id: string): Promise<void> {
    await UIService.delete(`/api/pacientes/${id}`);
  }

  static async getPatient(id: string): Promise<Paciente> {
    return UIService.get<Paciente>(`/api/pacientes/${id}`);
  }
}
