import { createFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "@/pages/RegisterPage";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Criar conta — StockControl" }] }),
  component: RegisterPage,
});
