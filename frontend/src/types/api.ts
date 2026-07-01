// Tipos espelhando DTOs oficiais da API (documentação técnica v2.0.0).
// Não modificar nomes de campos — eles devem refletir exatamente o contrato JSON.

export type UUID = string;
export type ISODate = string;

// ----- Envelopes JSON -----
export interface ApiMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
  meta?: ApiMeta;
}

export interface ApiListSuccess<T> {
  success: true;
  data: T[];
  meta: ApiMeta;
  message?: string;
}

export interface ApiNoBody {
  success: true;
  message: string;
}

export interface ApiError {
  success: false;
  error: ApiErrorBody;
}

// ----- Auth -----
export interface UserResponseDTO {
  id: UUID;
  name: string;
  email: string;
  created_at?: ISODate;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthPayload {
  user: UserResponseDTO;
  token: string;
}

// ----- Categories -----
export interface CategoryResponseDTO {
  id: UUID;
  name: string;
  description: string | null;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
}

export type UpdateCategoryDTO = Partial<CreateCategoryDTO>;

// ----- Products -----
export interface ProductResponseDTO {
  id: UUID;
  category_id: UUID | null;
  category: { id: UUID; name: string } | null;
  name: string;
  description: string | null;
  sku: string | null;
  price: number;
  quantity: number;
  min_quantity: number;
  unit: string;
  is_active: boolean;
  low_stock: boolean;
  image_url: string | null;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface CreateProductDTO {
  name: string;
  category_id?: UUID | null;
  description?: string;
  sku?: string;
  price: number;
  quantity: number;
  min_quantity?: number;
  unit?: string;
}

export type UpdateProductDTO = Partial<Omit<CreateProductDTO, "quantity">>;
export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: UUID;
  is_active?: boolean;
  low_stock?: boolean;
  sort_by?: "name" | "quantity" | "price" | "created_at";
  sort_order?: "ASC" | "DESC";
}

// ----- Stock Movements -----
export type StockMovementType = "IN" | "OUT" | "ADJUSTMENT";

export interface StockMovementResponseDTO {
  id: UUID;
  product_id: UUID;
  product: { id: UUID; name: string };
  user_id: UUID | null;
  user: { id: UUID; name: string } | null;
  type: StockMovementType;
  quantity: number;
  reason: string | null;
  product_quantity_after: number;
  created_at: ISODate;
}

export interface CreateStockMovementDTO {
  product_id: UUID;
  type: StockMovementType;
  quantity: number;
  reason?: string;
}

export interface StockMovementListQuery {
  page?: number;
  limit?: number;
  product_id?: UUID;
  type?: StockMovementType;
  start_date?: string; // YYYY-MM-DD
  end_date?: string;
}

// ----- Dashboard -----
export interface DashboardSummaryResponseDTO {
  total_products: number;
  active_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_categories: number;
  total_stock_value: number;
  movements_today: number;
  movements_this_month: number;
}
