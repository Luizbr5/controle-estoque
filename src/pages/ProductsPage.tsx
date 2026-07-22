import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "@tanstack/react-router";
import { Plus, Search, Pencil, Trash2, Eye, Package } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui-kit/Button";
import { Input, Select } from "@/components/ui-kit/Input";
import { Card, CardBody } from "@/components/ui-kit/Card";
import { Badge } from "@/components/ui-kit/Badge";
import { Skeleton } from "@/components/ui-kit/Skeleton";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { Modal } from "@/components/ui-kit/Modal";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { currency } from "@/utils/format";
import type { ProductResponseDTO } from "@/types/api";
import { ApiClientError } from "@/services/api";

const productSchema = z.object({
  name: z.string().min(2, "Mínimo de 2 caracteres"),
  category_id: z.string().optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  price: z.coerce.number().min(0, "Preço deve ser >= 0"),
  quantity: z.coerce.number().int().min(0, "Quantidade deve ser >= 0"),
  min_quantity: z.coerce.number().int().min(0).optional(),
  unit: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

function statusBadge(p: ProductResponseDTO) {
  if (!p.is_active) return <Badge variant="neutral">Inativo</Badge>;
  if (p.quantity === 0) return <Badge variant="danger">Sem estoque</Badge>;
  if (p.low_stock) return <Badge variant="warning">Estoque baixo</Badge>;
  return <Badge variant="success">Ativo</Badge>;
}

export function ProductsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductResponseDTO | null>(null);

  const categoriesQ = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.list(),
  });

  const productsQ = useQuery({
    queryKey: ["products", { page, search, categoryId, lowStock }],
    queryFn: () =>
      productService.list({
        page,
        limit: 20,
        search: search || undefined,
        category_id: categoryId || undefined,
        low_stock: lowStock || undefined,
      }),
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({
      name: "",
      category_id: "",
      description: "",
      sku: "",
      price: 0,
      quantity: 0,
      min_quantity: 5,
      unit: "un",
    });
    setModalOpen(true);
  };

  const openEdit = (p: ProductResponseDTO) => {
    setEditing(p);
    form.reset({
      name: p.name,
      category_id: p.category_id ?? "",
      description: p.description ?? "",
      sku: p.sku ?? "",
      price: p.price,
      quantity: p.quantity,
      min_quantity: p.min_quantity,
      unit: p.unit,
    });
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const payload = {
        ...values,
        category_id: values.category_id || undefined,
        sku: values.sku || undefined,
        description: values.description || undefined,
      };
      if (editing) return productService.update(editing.id, payload);
      return productService.create(payload);
    },
    onSuccess: () => {
      toast.success(editing ? "Produto atualizado" : "Produto criado");
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setModalOpen(false);
    },
    onError: (e) => toast.error((e as ApiClientError).message),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: () => {
      toast.success("Produto desativado");
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error((e as ApiClientError).message),
  });

  return (
    <div>
      <PageHeader
        title="Produtos"
        description="Gerencie o catálogo, preços e níveis de estoque."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Novo Produto
          </Button>
        }
      />

      <Card>
        <CardBody>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou SKU"
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                className="[&_input]:pl-9"
              />
            </div>
            <Select
              value={categoryId}
              onChange={(e) => {
                setPage(1);
                setCategoryId(e.target.value);
              }}
            >
              <option value="">Todas as categorias</option>
              {categoriesQ.data?.data.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <label className="flex h-10 items-center gap-2 rounded-md border border-input bg-surface px-3 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={lowStock}
                onChange={(e) => {
                  setPage(1);
                  setLowStock(e.target.checked);
                }}
              />
              Apenas estoque baixo
            </label>
          </div>
        </CardBody>
      </Card>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium text-right">Preço</th>
                <th className="px-4 py-3 font-medium text-right">Qtd</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" aria-label="Ações" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {productsQ.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : productsQ.data && productsQ.data.data.length > 0 ? (
                productsQ.data.data.map((p) => (
                  <tr key={p.id} className="hover:bg-accent/30">
                    <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.sku ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.category?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-foreground">{currency(p.price)}</td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {p.quantity} {p.unit}
                    </td>
                    <td className="px-4 py-3">{statusBadge(p)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link to="/products/$id" params={{ id: p.id }}>
                          <Button variant="icon" size="icon" aria-label="Ver">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="icon"
                          size="icon"
                          onClick={() => openEdit(p)}
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="icon"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Desativar "${p.name}"?`)) removeMutation.mutate(p.id);
                          }}
                          aria-label="Desativar"
                        >
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={Package}
                      title="Nenhum produto encontrado"
                      description="Crie seu primeiro produto usando o botão acima."
                      action={
                        <Button onClick={openCreate}>
                          <Plus className="h-4 w-4" /> Novo Produto
                        </Button>
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {productsQ.data && productsQ.data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              Página {productsQ.data.meta.page} de {productsQ.data.meta.totalPages}
              {" · "}
              {productsQ.data.meta.total} itens
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= productsQ.data.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar produto" : "Novo produto"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={form.handleSubmit((v) => saveMutation.mutate(v))}
              loading={saveMutation.isPending}
            >
              {editing ? "Salvar alterações" : "Criar produto"}
            </Button>
          </>
        }
      >
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Nome"
            required
            error={form.formState.errors.name?.message}
            {...form.register("name")}
            className="sm:col-span-2"
          />
          <Select label="Categoria" {...form.register("category_id")}>
            <option value="">Sem categoria</option>
            {categoriesQ.data?.data.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Input label="SKU" {...form.register("sku")} error={form.formState.errors.sku?.message} />
          <Input
            type="number"
            step="0.01"
            label="Preço"
            required
            {...form.register("price")}
            error={form.formState.errors.price?.message}
          />
          {!editing && (
            <Input
              type="number"
              label="Quantidade"
              required
              {...form.register("quantity")}
              error={form.formState.errors.quantity?.message}
            />
          )}
          <Input
            type="number"
            label="Estoque mínimo"
            {...form.register("min_quantity")}
            hint="Padrão: 5"
          />
          <Input label="Unidade" placeholder="un, cx, kg…" {...form.register("unit")} />
          <Input label="Descrição" className="sm:col-span-2" {...form.register("description")} />
        </form>
      </Modal>
    </div>
  );
}
