// Serviço específico para operações com sessões
import { UIService } from "./uiService";
import type {
  BulkPayOwnerMonthPayload,
  PendingSessionPreviewItem,
  PaySingleSessionPayload,
  Sessao,
} from "~/types/sessao";
import type { PacienteOption } from "~/types/paciente";
import type { PaginatedResponse } from "~/types/shared";

export class SessionService {
  static async getAllPatients(): Promise<PacienteOption[]> {
    try {
      let allPatients: PacienteOption[] = [];
      let page = 1;
      const perPage = 100;

      // Carregar todas as páginas de pacientes
      while (true) {
        const url = `/api/pacientes?page=${page}&perPage=${perPage}&status=todos`;
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

  static async payAllPendingByMonth(
    payload: BulkPayOwnerMonthPayload,
  ): Promise<{ success: boolean; updatedCount: number }> {
    return UIService.post<{ success: boolean; updatedCount: number }>(
      "/api/sessoes/pay-all",
      payload,
    );
  }

  static async getPendingSessionsPreview(
    payload: BulkPayOwnerMonthPayload,
  ): Promise<{ success: boolean; items: PendingSessionPreviewItem[] }> {
    return UIService.post<{
      success: boolean;
      items: PendingSessionPreviewItem[];
    }>("/api/sessoes/pending-preview", payload);
  }

  static async paySingleSession(
    payload: PaySingleSessionPayload,
  ): Promise<{ success: boolean; updated: boolean }> {
    return UIService.post<{ success: boolean; updated: boolean }>(
      "/api/sessoes/pay-single",
      payload,
      { showLoading: false },
    );
  }
}
