import type { Paciente } from "../types/paciente";

export const patientService = {
  async getAll(): Promise<Paciente[]> {
    const res = await fetch("/api/pacientes");
    const data = await res.json();
    return data.items || [];
  },

  async save(paciente: Paciente): Promise<Response> {
    const method = paciente.id ? "PUT" : "POST";
    const url = paciente.id ? `/api/pacientes/${paciente.id}` : "/api/pacientes";
    return fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paciente),
    });
  }
};