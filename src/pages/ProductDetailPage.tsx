import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, ImagePlus, Plus, Package } from "lucide-react";
import { toast } from "sonner";
import { productService } from "@/services/product.service";
import { stockMovementService } from "@/services/stock-movement.service";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui-kit/Card";
import { Skeleton } from "@/components/ui-kit/Skeleton";
import { Badge } from "@/components/ui-kit/Badge";
import { Button } from "@/components/ui-kit/Button";
import { currency, dateTime } from "@/utils/format";
import { StockMovementModal } from "@/components/StockMovementModal";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import type { StockMovementType } from "@/types/api";
import { ApiClientError } from "@/services/api";

const typeLabel: Record<StockMovementType, { label: string; variant: "success" | "danger" | "primary" }> = {
  IN: { label: "Entrada", variant: "success" },
  OUT: { label: "Saída", variant: "danger" },
  ADJUSTMENT: { label: "Ajuste", variant: "primary" },
};

export function ProductDetailPage() {
  const { id } = useParams({ from: "/_app/products/$id" });
  const qc = useQueryClient();
  const [moveOpen, setMoveOpen] = useState(false);

  const productQ = useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getById(id),
  });

  const movementsQ = useQuery({
    queryKey: ["stock-movements", { product_id: id }],
    queryFn: () => stockMovementService.list({ product_id: id, limit: 20 }),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => productService.uploadImage(id, file),
    onSuccess: () => {
      toast.success("Imagem atualizada");
      qc.invalidateQueries({ queryKey: ["product", id] });
    },
    onError: (e) => toast.error((e as ApiClientError).message),
  });

  const product = productQ.data;

  return (
    <div>
      <Link
        to="/products"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para produtos
      </Link>

      <PageHeader
        title={product?.name ?? "Produto"}
        description={product?.category?.name ?? undefined}
        actions={
          product && (
            <Button onClick={() => setMoveOpen(true)}>
              <Plus className="h-4 w-4" /> Nova movimentação
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardBody>
            <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted/30">
              {product?.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <label className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-accent">
              <ImagePlus className="h-4 w-4" />
              {product?.image_url ? "Trocar imagem" : "Enviar imagem"}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadMutation.mutate(f);
                }}
              />
            </label>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardBody>
            {productQ.isLoading || !product ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : (
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <Field label="SKU" value={product.sku ?? "—"} />
                <Field label="Unidade" value={product.unit} />
                <Field label="Preço" value={currency(product.price)} />
                <Field label="Estoque atual" value={`${product.quantity} ${product.unit}`} />
                <Field label="Estoque mínimo" value={`${product.min_quantity} ${product.unit}`} />
                <Field
                  label="Status"
                  value={
                    <Badge
                      variant={
                        !product.is_active
                          ? "neutral"
                          : product.quantity === 0
                            ? "danger"
                            : product.low_stock
                              ? "warning"
                              : "success"
                      }
                    >
                      {!product.is_active
                        ? "Inativo"
                        : product.quantity === 0
                          ? "Sem estoque"
                          : product.low_stock
                            ? "Estoque baixo"
                            : "Ativo"}
                    </Badge>
                  }
                />
                <div className="sm:col-span-2">
                  <Field label="Descrição" value={product.description ?? "—"} />
                </div>
              </dl>
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Histórico de movimentações</CardTitle>
        </CardHeader>
        <CardBody>
          {movementsQ.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : movementsQ.data && movementsQ.data.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-2 py-2 font-medium">Tipo</th>
                    <th className="px-2 py-2 font-medium text-right">Qtd</th>
                    <th className="px-2 py-2 font-medium text-right">Após</th>
                    <th className="px-2 py-2 font-medium">Motivo</th>
                    <th className="px-2 py-2 font-medium">Usuário</th>
                    <th className="px-2 py-2 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {movementsQ.data.data.map((m) => (
                    <tr key={m.id}>
                      <td className="px-2 py-3">
                        <Badge variant={typeLabel[m.type].variant}>{typeLabel[m.type].label}</Badge>
                      </td>
                      <td className="px-2 py-3 text-right font-medium">{m.quantity}</td>
                      <td className="px-2 py-3 text-right">{m.product_quantity_after}</td>
                      <td className="px-2 py-3 text-muted-foreground">{m.reason ?? "—"}</td>
                      <td className="px-2 py-3 text-muted-foreground">{m.user?.name ?? "—"}</td>
                      <td className="px-2 py-3 text-muted-foreground">{dateTime(m.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={Package} title="Sem histórico" description="Registre a primeira movimentação." />
          )}
        </CardBody>
      </Card>

      {product && (
        <StockMovementModal
          open={moveOpen}
          onClose={() => setMoveOpen(false)}
          defaultProductId={product.id}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ["product", id] });
            qc.invalidateQueries({ queryKey: ["stock-movements"] });
            qc.invalidateQueries({ queryKey: ["products"] });
            qc.invalidateQueries({ queryKey: ["dashboard"] });
          }}
        />
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}
