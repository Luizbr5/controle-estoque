import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui-kit/Button";
import { Input, Textarea } from "@/components/ui-kit/Input";
import { Card, CardBody } from "@/components/ui-kit/Card";
import { Skeleton } from "@/components/ui-kit/Skeleton";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { Modal } from "@/components/ui-kit/Modal";
import { categoryService } from "@/services/category.service";
import type { CategoryResponseDTO } from "@/types/api";
import { ApiClientError } from "@/services/api";

const schema = z.object({
  name: z.string().min(2, "Mínimo de 2 caracteres"),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function CategoriesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryResponseDTO | null>(null);

  const listQ = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.list(),
  });

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: "", description: "" });
    setOpen(true);
  };

  const openEdit = (c: CategoryResponseDTO) => {
    setEditing(c);
    form.reset({ name: c.name, description: c.description ?? "" });
    setOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (v: FormValues) =>
      editing
        ? categoryService.update(editing.id, { name: v.name, description: v.description || undefined })
        : categoryService.create({ name: v.name, description: v.description || undefined }),
    onSuccess: () => {
      toast.success(editing ? "Categoria atualizada" : "Categoria criada");
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setOpen(false);
    },
    onError: (e) => toast.error((e as ApiClientError).message),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => categoryService.remove(id),
    onSuccess: () => {
      toast.success("Categoria removida");
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (e) => toast.error((e as ApiClientError).message),
  });

  return (
    <div>
      <PageHeader
        title="Categorias"
        description="Organize seus produtos em categorias."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Nova categoria
          </Button>
        }
      />

      {listQ.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : listQ.data && listQ.data.data.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listQ.data.data.map((c) => (
            <Card key={c.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-foreground">{c.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {c.description ?? "Sem descrição"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="icon" size="icon" onClick={() => openEdit(c)} aria-label="Editar">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="icon"
                      size="icon"
                      onClick={() => {
                        if (confirm(`Remover "${c.name}"?`)) removeMutation.mutate(c.id);
                      }}
                      aria-label="Remover"
                    >
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody>
            <EmptyState
              icon={FolderTree}
              title="Nenhuma categoria cadastrada"
              description="Crie sua primeira categoria para organizar produtos."
              action={
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" /> Nova categoria
                </Button>
              }
            />
          </CardBody>
        </Card>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar categoria" : "Nova categoria"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={form.handleSubmit((v) => saveMutation.mutate(v))}
              loading={saveMutation.isPending}
            >
              {editing ? "Salvar" : "Criar"}
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4">
          <Input
            label="Nome"
            required
            error={form.formState.errors.name?.message}
            {...form.register("name")}
          />
          <Textarea label="Descrição" {...form.register("description")} />
        </form>
      </Modal>
    </div>
  );
}
