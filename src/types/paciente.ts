export interface Paciente {
  id?: string;
  nome: string;
  data_nascimento?: string;
  email?: string;
  contato?: string;
  endereco?: string;
  data_inicio: string;
  valor_sessao: number;
  ativo: boolean;
  owner?: string; // ID do usuário do PocketBase
}
