import { createFileRoute } from "@tanstack/react-router";
import { CategoriesPage } from "@/pages/CategoriesPage";

export const Route = createFileRoute("/_app/categories")({
  head: () => ({ meta: [{ title: "Categorias — StockControl" }] }),
  component: CategoriesPage,
});
