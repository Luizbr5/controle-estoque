import { api, USE_MOCK, mockDelay, toClientError } from "./api";
import { categories, products, stockMovements } from "./mock-db";
import type {
  ApiSuccess,
  ApiListSuccess,
  DashboardSummaryResponseDTO,
  ProductResponseDTO,
  StockMovementResponseDTO,
} from "@/types/api";

export const dashboardService = {
  async summary(): Promise<DashboardSummaryResponseDTO> {
    if (USE_MOCK) {
      const active = products.filter((p) => p.is_active);
      const today = new Date();
      const isSameDay = (d: string) => new Date(d).toDateString() === today.toDateString();
      const isSameMonth = (d: string) => {
        const dt = new Date(d);
        return dt.getFullYear() === today.getFullYear() && dt.getMonth() === today.getMonth();
      };
      const summary: DashboardSummaryResponseDTO = {
        total_products: products.length,
        active_products: active.length,
        low_stock_count: active.filter((p) => p.quantity > 0 && p.quantity <= p.min_quantity).length,
        out_of_stock_count: active.filter((p) => p.quantity === 0).length,
        total_categories: categories.length,
        total_stock_value: active.reduce((s, p) => s + p.price * p.quantity, 0),
        movements_today: stockMovements.filter((m) => isSameDay(m.created_at)).length,
        movements_this_month: stockMovements.filter((m) => isSameMonth(m.created_at)).length,
      };
      return mockDelay(summary);
    }
    try {
      const { data } = await api.get<ApiSuccess<DashboardSummaryResponseDTO>>(
        "/dashboard/summary",
      );
      return data.data;
    } catch (e) {
      throw toClientError(e);
    }
  },

  async lowStock(): Promise<ProductResponseDTO[]> {
    if (USE_MOCK) {
      const list = products.filter(
        (p) => p.is_active && p.quantity <= p.min_quantity,
      );
      return mockDelay(list);
    }
    try {
      const { data } = await api.get<ApiListSuccess<ProductResponseDTO>>(
        "/dashboard/low-stock",
      );
      return data.data;
    } catch (e) {
      throw toClientError(e);
    }
  },

  async recentMovements(): Promise<StockMovementResponseDTO[]> {
    if (USE_MOCK) {
      return mockDelay([...stockMovements].slice(0, 10));
    }
    try {
      const { data } = await api.get<ApiListSuccess<StockMovementResponseDTO>>(
        "/dashboard/recent-movements",
      );
      return data.data;
    } catch (e) {
      throw toClientError(e);
    }
  },
};
