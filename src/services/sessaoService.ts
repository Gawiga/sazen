import { SessionService } from "./sessionService";
import {
  createSessao,
  deleteSessao,
  getSessaoById,
  listPendingSessoesForPreview,
  listSessoes,
  payAllPendingSessoesByMonth,
  paySingleSessaoFromPreview,
  updateSessao,
} from "./sessoesService";

export class SessaoService extends SessionService {
  static async listSessoes(
    request: Request,
    cookies: Parameters<typeof listSessoes>[1],
  ): Promise<Response> {
    return listSessoes(request, cookies);
  }

  static async createSessao(
    request: Request,
    cookies: Parameters<typeof createSessao>[1],
  ): Promise<Response> {
    return createSessao(request, cookies);
  }

  static async getSessaoById(
    id: string | undefined,
    request: Request,
    cookies: Parameters<typeof getSessaoById>[2],
  ): Promise<Response> {
    return getSessaoById(id, request, cookies);
  }

  static async updateSessao(
    id: string | undefined,
    request: Request,
    cookies: Parameters<typeof updateSessao>[2],
  ): Promise<Response> {
    return updateSessao(id, request, cookies);
  }

  static async deleteSessao(
    id: string | undefined,
    request: Request,
    cookies: Parameters<typeof deleteSessao>[2],
  ): Promise<Response> {
    return deleteSessao(id, request, cookies);
  }

  static async payAllPendingSessoesByMonth(
    request: Request,
    cookies: Parameters<typeof payAllPendingSessoesByMonth>[1],
  ): Promise<Response> {
    return payAllPendingSessoesByMonth(request, cookies);
  }

  static async listPendingSessoesForPreview(
    request: Request,
    cookies: Parameters<typeof listPendingSessoesForPreview>[1],
  ): Promise<Response> {
    return listPendingSessoesForPreview(request, cookies);
  }

  static async paySingleSessaoFromPreview(
    request: Request,
    cookies: Parameters<typeof paySingleSessaoFromPreview>[1],
  ): Promise<Response> {
    return paySingleSessaoFromPreview(request, cookies);
  }
}

export const sessaoService = SessaoService;
