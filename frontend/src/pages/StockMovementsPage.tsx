import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ArrowLeftRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui-kit/Button";
import { Card, CardBody } from "@/components/ui-kit/Card";
import { Input, Select } from "@/components/ui-kit/Input";
import { Skeleton } from "@/components/ui-kit/Skeleton";
import { Badge } from "@/components/ui-kit/Badge";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { StockMovementModal } from "@/components/StockMovementModal";
import { stockMovementService } from "@/services/stock-movement.service";
import { productService } from "@/services/product.service";
import { dateTime } from "@/utils/format";
import type { StockMovementType } from "@/types/api";

const typeBadge: Record<StockMovementType, { label: string; variant: "success" | "danger" | "primary" }> = {
  IN: { label: "Entrada", variant: "success" },
  OUT: { label: "Saída", variant: "danger" },
  ADJUSTMENT: { label: "Ajuste", variant: "primary" },
};

export function StockMovementsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [productId, setProductId] = useState("");
  const [type, setType] = useState<"" | StockMovementType>("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [open, setOpen] = useState(false);

  const productsQ = useQuery({
    queryKey: ["products", { all: true }],
    queryFn: () => productService.list({ limit: 100 }),
  });

  const listQ = useQuery({
    queryKey: ["stock-movements", { page, productId, type, start, end }],
    queryFn: () =>
      stockMovementService.list({
        page,
        limit: 20,
        product_id: productId || undefined,
        type: (type || undefined) as StockMovementType | undefined,
        start_date: start || undefined,
        end_date: end || undefined,
      }),
  });

  return (
    <div>
      <PageHeader
        title="Movimentações"
        description="Histórico imutável de entradas, saídas e ajustes."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Nova movimentação
          </Button>
        }
      />

      <Card>
        <CardBody>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select value={productId} onChange={(e) => { setProductId(e.target.value); setPage(1); }}>
              <option value="">Todos os produtos</option>
              {productsQ.data?.data.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
            <Select value={type} onChange={(e) => { setType(e.target.value as any); setPage(1); }}>
              <option value="">Todos os tipos</option>
              <option value="IN">Entrada</option>
              <option value="OUT">Saída</option>
              <option value="ADJUSTMENT">Ajuste</option>
            </Select>
            <Input type="date" value={start} onChange={(e) => { setStart(e.target.value); setPage(1); }} />
            <Input type="date" value={end} onChange={(e) => { setEnd(e.target.value); setPage(1); }} />
          </div>
        </CardBody>
      </Card>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium text-right">Qtd</th>
                <th className="px-4 py-3 font-medium text-right">Após</th>
                <th className="px-4 py-3 font-medium">Motivo</th>
                <th className="px-4 py-3 font-medium">Usuário</th>
                <th className="px-4 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {listQ.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : listQ.data && listQ.data.data.length > 0 ? (
                listQ.data.data.map((m) => (
                  <tr key={m.id} className="hover:bg-accent/30">
                    <td className="px-4 py-3">
                      <Badge variant={typeBadge[m.type].variant}>{typeBadge[m.type].label}</Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{m.product.name}</td>
                    <td className="px-4 py-3 text-right">{m.quantity}</td>
                    <td className="px-4 py-3 text-right">{m.product_quantity_after}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.reason ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.user?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{dateTime(m.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon={ArrowLeftRight} title="Nenhuma movimentação encontrada" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {listQ.data && listQ.data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              Página {listQ.data.meta.page} de {listQ.data.meta.totalPages}
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= listQ.data.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </Card>

      <StockMovementModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ["stock-movements"] });
          qc.invalidateQueries({ queryKey: ["products"] });
          qc.invalidateQueries({ queryKey: ["dashboard"] });
        }}
      />
    </div>
  );
}
