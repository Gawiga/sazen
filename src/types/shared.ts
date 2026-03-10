export interface PaginatedResponse<T> {
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
  items: T[];
}

export interface PaginationConfig {
  page: number;
  perPage: number;
  sort?: string;
}

export interface AuthFetchOptions extends RequestInit {
  showLoading?: boolean;
}
