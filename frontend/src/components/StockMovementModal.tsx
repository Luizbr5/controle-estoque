import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui-kit/Modal";
import { Button } from "@/components/ui-kit/Button";
import { Input, Select } from "@/components/ui-kit/Input";
import { productService } from "@/services/product.service";
import { stockMovementService } from "@/services/stock-movement.service";
import type { StockMovementType } from "@/types/api";
import { ApiClientError } from "@/services/api";
import { useEffect } from "react";

const schema = z.object({
  product_id: z.string().min(1, "Selecione o produto"),
  type: z.enum(["IN", "OUT", "ADJUSTMENT"] as const),
  quantity: z.coerce.number().int().positive("Deve ser > 0"),
  reason: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  defaultProductId?: string;
  onSuccess?: () => void;
}

export function StockMovementModal({ open, onClose, defaultProductId, onSuccess }: Props) {
  const productsQ = useQuery({
    queryKey: ["products", { all: true }],
    queryFn: () => productService.list({ limit: 100 }),
    enabled: open,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      product_id: defaultProductId ?? "",
      type: "IN",
      quantity: 1,
      reason: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        product_id: defaultProductId ?? "",
        type: "IN" as StockMovementType,
        quantity: 1,
        reason: "",
      });
    }
  }, [open, defaultProductId, form]);

  const mutation = useMutation({
    mutationFn: (v: FormValues) =>
      stockMovementService.create({
        product_id: v.product_id,
        type: v.type,
        quantity: v.quantity,
        reason: v.reason || undefined,
      }),
    onSuccess: () => {
      toast.success("Movimentação registrada");
      onSuccess?.();
      onClose();
    },
    onError: (e) => toast.error((e as ApiClientError).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nova movimentação"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit((v) => mutation.mutate(v))}
            loading={mutation.isPending}
          >
            Registrar
          </Button>
        </>
      }
    >
      <form className="flex flex-col gap-4">
        <Select
          label="Produto"
          required
          {...form.register("product_id")}
          error={form.formState.errors.product_id?.message}
          disabled={!!defaultProductId}
        >
          <option value="">Selecione…</option>
          {productsQ.data?.data.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.quantity} {p.unit})
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Tipo" required {...form.register("type")}>
            <option value="IN">Entrada (IN)</option>
            <option value="OUT">Saída (OUT)</option>
            <option value="ADJUSTMENT">Ajuste (ADJUSTMENT)</option>
          </Select>
          <Input
            type="number"
            label="Quantidade"
            required
            {...form.register("quantity")}
            error={form.formState.errors.quantity?.message}
          />
        </div>
        <Input
          label="Motivo"
          hint="Fortemente recomendado para auditoria"
          {...form.register("reason")}
        />
      </form>
    </Modal>
  );
}
