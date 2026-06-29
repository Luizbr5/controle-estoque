import { categoryRepository } from "@/repositories/category.repository";
import { productRepository } from "@/repositories/product.repository";
import { stockMovementRepository } from "@/repositories/stockMovement.repository";
import { toProductDTO } from "./product.service";
import { toStockMovementDTO } from "./stockMovement.service";
import type {
  ApiListSuccess,
  DashboardSummaryResponseDTO,
  ProductResponseDTO,
  StockMovementResponseDTO,
} from "@/types/api.types";

function listMeta(total: number, limit: number): ApiListSuccess<unknown>["meta"] {
  return { total, page: 1, limit: limit || 1, totalPages: 1 };
}

function utcDayBounds(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
  );
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999),
  );
  return { start, end };
}

function utcMonthBounds(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
  return { start, end };
}

export const dashboardService = {
  async summary(): Promise<DashboardSummaryResponseDTO> {
    const [allProducts, totalCategories] = await Promise.all([
      productRepository.findAllRaw(),
      categoryRepository.count(),
    ]);

    const active = allProducts.filter((p) => p.isActive);
    const lowStockCount = active.filter(
      (p) => p.quantity > 0 && p.quantity <= p.minQuantity,
    ).length;
    const outOfStockCount = active.filter((p) => p.quantity === 0).length;
    const totalStockValue = active.reduce((sum, p) => sum + Number(p.price) * p.quantity, 0);

    const today = utcDayBounds();
    const month = utcMonthBounds();
    const [movementsToday, movementsThisMonth] = await Promise.all([
      stockMovementRepository.countByDateRange(today.start, today.end),
      stockMovementRepository.countByDateRange(month.start, month.end),
    ]);

    return {
      total_products: allProducts.length,
      active_products: active.length,
      low_stock_count: lowStockCount,
      out_of_stock_count: outOfStockCount,
      total_categories: totalCategories,
      total_stock_value: Math.round(totalStockValue * 100) / 100,
      movements_today: movementsToday,
      movements_this_month: movementsThisMonth,
    };
  },

  async lowStock(): Promise<{
    data: ProductResponseDTO[];
    meta: ApiListSuccess<ProductResponseDTO>["meta"];
  }> {
    const all = await productRepository.search({ isActive: true });
    const low = all.filter((p) => p.quantity <= p.minQuantity).map(toProductDTO);
    return { data: low, meta: listMeta(low.length, low.length) };
  },

  async recentMovements(): Promise<{
    data: StockMovementResponseDTO[];
    meta: ApiListSuccess<StockMovementResponseDTO>["meta"];
  }> {
    const recent = await stockMovementRepository.findRecent(10);
    const data = recent.map(toStockMovementDTO);
    return { data, meta: listMeta(data.length, 10) };
  },
};
