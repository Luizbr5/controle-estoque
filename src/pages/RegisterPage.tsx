import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { Boxes } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui-kit/Button";
import { Input } from "@/components/ui-kit/Input";
import { useAuth } from "@/contexts/AuthContext";
import { ApiClientError } from "@/services/api";

const schema = z.object({
  name: z.string().min(2, "Mínimo de 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const { register: doRegister } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await doRegister(values);
      toast.success("Conta criada com sucesso!");
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error((e as ApiClientError).message ?? "Falha ao criar conta");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-lg"
      >
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="rounded-lg bg-primary p-2 text-primary-foreground">
            <Boxes className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold">Criar conta</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre-se para começar a controlar seu estoque
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Nome" required error={errors.name?.message} {...register("name")} />
          <Input
            type="email"
            label="E-mail"
            required
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            type="password"
            label="Senha"
            required
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
            Criar conta
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
