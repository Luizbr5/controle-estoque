import { categoryRepository } from "@/repositories/category.repository";
import { productRepository } from "@/repositories/product.repository";
import { stockMovementRepository } from "@/repositories/stockMovement.repository";
import { cache } from "@/config/cache";
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

// Tipos para cache
type DashboardSummaryResult = DashboardSummaryResponseDTO;
type LowStockResult = {
  data: ProductResponseDTO[];
  meta: ApiListSuccess<ProductResponseDTO>["meta"];
};
type RecentMovementsResult = {
  data: StockMovementResponseDTO[];
  meta: ApiListSuccess<StockMovementResponseDTO>["meta"];
};

export const dashboardService = {
  async summary(companyId: string): Promise<DashboardSummaryResult> {
    // Tentar pegar do cache
    const cacheKey = `dashboard:summary:${companyId}`;
    const cached = cache.get<DashboardSummaryResult>(cacheKey);
    if (cached) {
      return cached;
    }

    const [allProducts, totalCategories] = await Promise.all([
      productRepository.findAllRaw(companyId),
      categoryRepository.count(companyId),
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
      stockMovementRepository.countByDateRange(companyId, today.start, today.end),
      stockMovementRepository.countByDateRange(companyId, month.start, month.end),
    ]);

    const result: DashboardSummaryResult = {
      total_products: allProducts.length,
      active_products: active.length,
      low_stock_count: lowStockCount,
      out_of_stock_count: outOfStockCount,
      total_categories: totalCategories,
      total_stock_value: Math.round(totalStockValue * 100) / 100,
      movements_today: movementsToday,
      movements_this_month: movementsThisMonth,
    };

    // Guardar no cache por 1 minuto (dados mais sensíveis)
    cache.set<DashboardSummaryResult>(cacheKey, result, 60);

    return result;
  },

  async lowStock(companyId: string): Promise<LowStockResult> {
    // Tentar pegar do cache
    const cacheKey = `dashboard:low-stock:${companyId}`;
    const cached = cache.get<LowStockResult>(cacheKey);
    if (cached) {
      return cached;
    }

    const all = await productRepository.search({ companyId, isActive: true });
    const low = all.filter((p) => p.quantity <= p.minQuantity).map(toProductDTO);
    const result: LowStockResult = { data: low, meta: listMeta(low.length, low.length) };

    // Guardar no cache por 5 minutos
    cache.set<LowStockResult>(cacheKey, result, 300);

    return result;
  },

  async recentMovements(companyId: string): Promise<RecentMovementsResult> {
    // Tentar pegar do cache
    const cacheKey = `dashboard:recent-movements:${companyId}`;
    const cached = cache.get<RecentMovementsResult>(cacheKey);
    if (cached) {
      return cached;
    }

    const recent = await stockMovementRepository.findRecent(companyId, 10);
    const data = recent.map(toStockMovementDTO);
    const result: RecentMovementsResult = { data, meta: listMeta(data.length, 10) };

    // Guardar no cache por 2 minutos (movimentos são mais frequentes)
    cache.set<RecentMovementsResult>(cacheKey, result, 120);

    return result;
  },
};