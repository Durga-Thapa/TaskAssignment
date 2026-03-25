export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  skip: number;
  totalPages: number;
}
