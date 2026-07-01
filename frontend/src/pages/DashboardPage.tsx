import { useQuery } from "@tanstack/react-query";
import {
  Package,
  AlertTriangle,
  XCircle,
  DollarSign,
  TrendingUp,
  ArrowDown,
  ArrowUp,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  CartesianGrid,
} from "recharts";
import { dashboardService } from "@/services/dashboard.service";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui-kit/Card";
import { Badge } from "@/components/ui-kit/Badge";
import { Skeleton } from "@/components/ui-kit/Skeleton";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { currency, number, dateTime } from "@/utils/format";
import type { StockMovementType } from "@/types/api";
import { Link } from "@tanstack/react-router";

const cards = [
  { key: "total_products", label: "Total de Produtos", icon: Package, accent: "text-primary" },
  { key: "low_stock_count", label: "Estoque Baixo", icon: AlertTriangle, accent: "text-warning" },
  { key: "out_of_stock_count", label: "Sem Estoque", icon: XCircle, accent: "text-danger" },
  { key: "total_stock_value", label: "Valor Total", icon: DollarSign, accent: "text-success" },
] as const;

const typeBadge: Record<StockMovementType, { label: string; variant: "success" | "danger" | "primary" }> = {
  IN: { label: "Entrada", variant: "success" },
  OUT: { label: "Saída", variant: "danger" },
  ADJUSTMENT: { label: "Ajuste", variant: "primary" },
};

const typeIcon = {
  IN: ArrowDown,
  OUT: ArrowUp,
  ADJUSTMENT: RefreshCw,
} as const;

export function DashboardPage() {
  const summary = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => dashboardService.summary(),
  });
  const lowStock = useQuery({
    queryKey: ["dashboard", "low-stock"],
    queryFn: () => dashboardService.lowStock(),
  });
  const recent = useQuery({
    queryKey: ["dashboard", "recent-movements"],
    queryFn: () => dashboardService.recentMovements(),
  });

  const chartData = (recent.data ?? [])
    .slice(0, 8)
    .reverse()
    .map((m, i) => ({
      name: `#${i + 1}`,
      qtd: m.quantity,
    }));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral do estoque, alertas e movimentações recentes."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          const value = summary.data?.[c.key];
          const isMoney = c.key === "total_stock_value";
          return (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {c.label}
                      </p>
                      {summary.isLoading ? (
                        <Skeleton className="mt-2 h-7 w-24" />
                      ) : (
                        <p className="mt-1 text-2xl font-semibold text-foreground">
                          {value === undefined
                            ? "—"
                            : isMoney
                              ? currency(value as number)
                              : number(value as number)}
                        </p>
                      )}
                    </div>
                    <div className={`rounded-md bg-muted p-2 ${c.accent}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Movimentações recentes
            </CardTitle>
          </CardHeader>
          <CardBody>
            {recent.isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : chartData.length === 0 ? (
              <EmptyState icon={TrendingUp} title="Sem movimentações ainda" />
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                    <ReTooltip
                      contentStyle={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="qtd" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" /> Estoque baixo
            </CardTitle>
          </CardHeader>
          <CardBody>
            {lowStock.isLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : lowStock.data && lowStock.data.length > 0 ? (
              <ul className="divide-y divide-border">
                {lowStock.data.slice(0, 6).map((p) => (
                  <li key={p.id}>
                    <Link
                      to="/products/$id"
                      params={{ id: p.id }}
                      className="flex items-center justify-between py-2.5 hover:bg-accent/30"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.category?.name ?? "Sem categoria"}
                        </p>
                      </div>
                      <Badge variant={p.quantity === 0 ? "danger" : "warning"}>
                        {p.quantity} {p.unit}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={Package} title="Tudo em ordem" description="Nenhum produto com estoque baixo." />
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Feed de movimentações</CardTitle>
        </CardHeader>
        <CardBody>
          {recent.isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recent.data && recent.data.length > 0 ? (
            <ul className="divide-y divide-border">
              {recent.data.map((m) => {
                const Icon = typeIcon[m.type];
                const tb = typeBadge[m.type];
                return (
                  <li key={m.id} className="flex items-center gap-3 py-3">
                    <div className="rounded-md bg-muted p-2 text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {m.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m.reason ?? "—"} · por {m.user?.name ?? "Sistema"}
                      </p>
                    </div>
                    <div className="hidden text-right md:block">
                      <p className="text-xs text-muted-foreground">{dateTime(m.created_at)}</p>
                    </div>
                    <Badge variant={tb.variant}>
                      {tb.label} · {m.quantity}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState icon={TrendingUp} title="Sem movimentações" />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
