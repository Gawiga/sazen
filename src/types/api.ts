// Paciente tipo completo
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

// Sessão tipo completo
export interface Sessao {
  id?: string;
  id_paciente: string;
  data: string; // ISO string
  valor: number;
  pago: boolean;
  owner?: string; // ID do usuário do PocketBase
}

// Dados usados na UI
export interface SessionItem extends Sessao {
  pacienteName?: string; // Adicionado na renderização
}

// Opção de seleção de paciente
export interface PacienteOption {
  id: string;
  nome: string;
  email?: string;
  valor_sessao?: number;
}

// Data de relatório
export interface RelatorioData {
  id?: string;
  paciente?: string;
  valor?: number;
  data?: string;
  [key: string]: string | number | undefined; // Para outras colunas dinâmicas
}

// Resposta paginada genérica
export interface PaginatedResponse<T> {
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
  items: T[];
}

// Configuração de paginação
export interface PaginationConfig {
  page: number;
  perPage: number;
  sort?: string;
}

// Configuração de requisição com autenticação
export interface AuthFetchOptions extends RequestInit {
  showLoading?: boolean;
}
