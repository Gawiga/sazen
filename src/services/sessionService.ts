// Serviço específico para operações com sessões
import { UIService } from "./uiService";
import type { Sessao, PacienteOption, PaginatedResponse } from "~/types/api";

export class SessionService {
  static async getAllPatients(): Promise<PacienteOption[]> {
    try {
      let allPatients: PacienteOption[] = [];
      let page = 1;
      const perPage = 100;

      // Carregar todas as páginas de pacientes
      while (true) {
        const url = `/api/pacientes?page=${page}&perPage=${perPage}`;
        const data = await UIService.get<PaginatedResponse<PacienteOption>>(
          url,
          {
            showLoading: page === 1,
          },
        );

        allPatients = allPatients.concat(data.items);

        if (page >= data.totalPages) break;
        page++;
      }

      // Ordenar alfabeticamente
      return allPatients.sort((a, b) =>
        (a.nome || "").localeCompare(b.nome || ""),
      );
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error);
      throw error;
    }
  }

  static async getSessions(
    page: number,
    perPage: number,
    sort = "-data",
  ): Promise<PaginatedResponse<Sessao>> {
    const url = `/api/sessoes?page=${page}&perPage=${perPage}&sort=${sort}`;
    return UIService.get<PaginatedResponse<Sessao>>(url);
  }

  static async createSession(payload: Partial<Sessao>): Promise<Sessao> {
    return UIService.post<Sessao>("/api/sessoes", payload);
  }

  static async updateSession(
    id: string,
    payload: Partial<Sessao>,
  ): Promise<Sessao> {
    return UIService.put<Sessao>(`/api/sessoes/${id}`, payload);
  }

  static async deleteSession(id: string): Promise<void> {
    await UIService.delete(`/api/sessoes/${id}`);
  }

  static async togglePaymentStatus(
    id: string,
    currentStatus: boolean,
  ): Promise<Sessao> {
    return UIService.put<Sessao>(`/api/sessoes/${id}`, {
      pago: !currentStatus,
    });
  }
}
