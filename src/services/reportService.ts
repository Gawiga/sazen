import { UIService } from "./uiService";
import type {
  ReportFaturamentoItem,
  ReportValoresReceberItem,
} from "~/types/relatorio";
import type { PaginatedResponse } from "~/types/shared";

export class ReportService {
  static async getFaturamento(
    page: number,
    perPage: number,
  ): Promise<PaginatedResponse<ReportFaturamentoItem>> {
    return UIService.get<PaginatedResponse<ReportFaturamentoItem>>(
      `/api/reports?collection=faturamento_mensal&page=${page}&perPage=${perPage}`,
    );
  }

  static async getValoresReceber(
    page: number,
    perPage: number,
  ): Promise<PaginatedResponse<ReportValoresReceberItem>> {
    return UIService.get<PaginatedResponse<ReportValoresReceberItem>>(
      `/api/reports?collection=valores_receber&page=${page}&perPage=${perPage}`,
    );
  }
}
