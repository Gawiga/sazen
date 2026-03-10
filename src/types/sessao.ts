export interface Sessao {
  id?: string;
  id_paciente: string;
  data: string;
  valor: number;
  pago: boolean;
  owner?: string;
}

export interface SessionItem extends Sessao {
  pacienteName?: string;
}

export interface BulkPayOwnerMonthPayload {
  monthKey?: string;
  ownerId?: string;
  patientId?: string;
  patientName?: string;
}

export interface PendingSessionPreviewItem {
  id: string;
  id_paciente: string;
  data: string;
  valor: number;
  pago: boolean;
  pacienteNome?: string;
}

export interface PaySingleSessionPayload extends BulkPayOwnerMonthPayload {
  sessionId: string;
}
