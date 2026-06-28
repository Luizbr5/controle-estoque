import { api, USE_MOCK, mockDelay, ApiClientError, toClientError } from "./api";
import { products, stockMovements, mockUser, newId, timestamp } from "./mock-db";
import type {
  ApiListSuccess,
  ApiSuccess,
  CreateStockMovementDTO,
  StockMovementListQuery,
  StockMovementResponseDTO,
} from "@/types/api";

export const stockMovementService = {
  async list(query: StockMovementListQuery = {}): Promise<{
    data: StockMovementResponseDTO[];
    meta: ApiListSuccess<StockMovementResponseDTO>["meta"];
  }> {
    if (USE_MOCK) {
      const page = query.page ?? 1;
      const limit = query.limit ?? 20;
      let list = [...stockMovements];
      if (query.product_id) list = list.filter((m) => m.product_id === query.product_id);
      if (query.type) list = list.filter((m) => m.type === query.type);
      if (query.start_date)
        list = list.filter((m) => m.created_at >= query.start_date! + "T00:00:00.000Z");
      if (query.end_date)
        list = list.filter((m) => m.created_at <= query.end_date! + "T23:59:59.999Z");
      list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      const total = list.length;
      const paged = list.slice((page - 1) * limit, page * limit);
      return mockDelay({
        data: paged,
        meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
      });
    }
    try {
      const { data } = await api.get<ApiListSuccess<StockMovementResponseDTO>>(
        "/stock-movements",
        { params: query },
      );
      return { data: data.data, meta: data.meta };
    } catch (e) {
      throw toClientError(e);
    }
  },

  async create(dto: CreateStockMovementDTO): Promise<StockMovementResponseDTO> {
    if (USE_MOCK) {
      const idx = products.findIndex((p) => p.id === dto.product_id && p.is_active);
      if (idx < 0) throw new ApiClientError("NOT_FOUND", "Produto não encontrado", 404);
      const product = products[idx];
      let newQty = product.quantity;
      if (dto.type === "IN") newQty += dto.quantity;
      else if (dto.type === "OUT") {
        if (dto.quantity > product.quantity) {
          throw new ApiClientError(
            "INSUFFICIENT_STOCK",
            `Quantidade insuficiente em estoque. Disponível: ${product.quantity}, solicitado: ${dto.quantity}`,
            422,
            { available: product.quantity, requested: dto.quantity },
          );
        }
        newQty -= dto.quantity;
      } else if (dto.type === "ADJUSTMENT") {
        newQty = dto.quantity;
      }
      products[idx] = {
        ...product,
        quantity: newQty,
        low_stock: newQty <= product.min_quantity,
        updated_at: timestamp(),
      };
      const mov: StockMovementResponseDTO = {
        id: newId(),
        product_id: product.id,
        product: { id: product.id, name: product.name },
        user_id: mockUser.id,
        user: { id: mockUser.id, name: mockUser.name },
        type: dto.type,
        quantity: dto.quantity,
        reason: dto.reason ?? null,
        product_quantity_after: newQty,
        created_at: timestamp(),
      };
      stockMovements.unshift(mov);
      return mockDelay(mov);
    }
    try {
      const { data } = await api.post<ApiSuccess<StockMovementResponseDTO>>(
        "/stock-movements",
        dto,
      );
      return data.data;
    } catch (e) {
      throw toClientError(e);
    }
  },
};
