import type { APIRoute } from "astro";
import type PocketBase from "pocketbase";
import {
  getErrorStatus,
  getPb,
  getTokenOrUnauthorized,
  parsePagination,
  unauthorizedResponse,
} from "../../../services/sharedService";
const MAX_FETCH_PER_PAGE = 100;

function toMonthKey(dateValue: string): string | null {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function normalizePositiveInt(value: number): number {
  if (!Number.isFinite(value) || value < 1) return 1;
  return Math.floor(value);
}

async function getPendingSessionsForValuesReceber(pb: PocketBase) {
  const result: Array<{
    id_paciente: string;
    owner: string;
    data: string;
    valor: number;
  }> = [];

  let page = 1;
  while (true) {
    const list = await pb
      .collection("sessao")
      .getList(page, MAX_FETCH_PER_PAGE, {
        filter: "pago = false",
        sort: "-data",
      });

    for (const item of list.items) {
      const patientId =
        typeof item?.id_paciente === "string" ? item.id_paciente.trim() : "";
      const owner = typeof item?.owner === "string" ? item.owner.trim() : "";
      const data = typeof item?.data === "string" ? item.data : "";

      if (!patientId || !data) continue;

      result.push({
        id_paciente: patientId,
        owner,
        data,
        valor:
          typeof item?.valor === "number"
            ? item.valor
            : Number(item?.valor) || 0,
      });
    }

    if (page >= list.totalPages) break;
    page += 1;
  }

  return result;
}

async function getPatientNameMap(pb: PocketBase, patientIds: string[]) {
  const nameMap = new Map<string, string>();
  const uniqueIds = Array.from(new Set(patientIds.filter((id) => id.trim())));

  await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        const patient = await pb.collection("paciente").getOne(id);
        const nome =
          typeof patient?.nome === "string" && patient.nome.trim()
            ? patient.nome.trim()
            : "";
        if (nome) nameMap.set(id, nome);
      } catch {
        // Ignore missing patient relation for report rendering.
      }
    }),
  );

  return nameMap;
}

async function getValoresReceberFromPendingSessions(
  pb: PocketBase,
  page: number,
  perPage: number,
) {
  const pendingSessions = await getPendingSessionsForValuesReceber(pb);

  const grouped = new Map<
    string,
    {
      mes_ano: string;
      id_paciente: string;
      owner_id: string;
      total: number;
    }
  >();

  for (const session of pendingSessions) {
    const monthKey = toMonthKey(session.data);
    if (!monthKey) continue;

    const key = `${monthKey}::${session.id_paciente}::${session.owner}`;
    const current = grouped.get(key);

    if (current) {
      current.total += session.valor;
      continue;
    }

    grouped.set(key, {
      mes_ano: monthKey,
      id_paciente: session.id_paciente,
      owner_id: session.owner,
      total: session.valor,
    });
  }

  const patientNameMap = await getPatientNameMap(
    pb,
    Array.from(grouped.values()).map((item) => item.id_paciente),
  );

  const aggregated = Array.from(grouped.values())
    .map((item, index) => ({
      id: `${item.mes_ano}-${item.id_paciente}-${index + 1}`,
      mes_ano: item.mes_ano,
      id_paciente: item.id_paciente,
      nome: patientNameMap.get(item.id_paciente) || "Paciente",
      owner_id: item.owner_id,
      total: item.total,
    }))
    .sort((a, b) => {
      if (a.mes_ano !== b.mes_ano) {
        return a.mes_ano < b.mes_ano ? 1 : -1;
      }
      return a.nome.localeCompare(b.nome, "pt-BR");
    });

  const totalItems = aggregated.length;
  const safePerPage = normalizePositiveInt(perPage);
  const totalPages = Math.max(1, Math.ceil(totalItems / safePerPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * safePerPage;
  const items = aggregated.slice(start, start + safePerPage);

  return {
    success: true,
    page: safePage,
    perPage: safePerPage,
    totalPages,
    totalItems,
    items,
  };
}

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const auth = getTokenOrUnauthorized(request, cookies);
    if (auth.response) return auth.response;

    const pb = getPb(auth.token);
    const url = new URL(request.url);
    const collection = url.searchParams.get("collection");
    const { page, perPage } = parsePagination(url);

    if (collection === "valores_receber") {
      const report = await getValoresReceberFromPendingSessions(
        pb,
        page,
        perPage,
      );
      return new Response(JSON.stringify(report), {
        status: 200,
      });
    }

    if (collection) {
      const list = await pb.collection(collection).getList(page, perPage);
      return new Response(JSON.stringify({ success: true, ...list }), {
        status: 200,
      });
    }

    const fatur = await pb.collection("faturamento_mensal").getList(1, perPage);
    const receber = await pb.collection("valores_receber").getList(1, perPage);
    return new Response(JSON.stringify({ success: true, fatur, receber }), {
      status: 200,
    });
  } catch (err) {
    if (getErrorStatus(err) === 401) return unauthorizedResponse();
    console.error("reports GET error", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500 },
    );
  }
};
