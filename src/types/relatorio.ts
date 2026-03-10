export interface RelatorioData {
  id?: string;
  paciente?: string;
  valor?: number;
  data?: string;
  [key: string]: string | number | undefined;
}

export interface ReportFaturamentoItem {
  mes_ano?: string;
  total?: number | string;
}

export interface ReportValoresReceberItem {
  id?: string | number;
  nome?: string;
  paciente?: string;
  mes?: string | number;
  mes_ano?: string;
  data?: string;
  total?: number | string;
  owner_id?: string;
  ownerId?: string;
  owner?: string;
  id_paciente?: string;
  paciente_id?: string;
  idPaciente?: string;
}
