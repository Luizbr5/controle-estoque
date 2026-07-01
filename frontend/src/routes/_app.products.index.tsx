import { createFileRoute } from "@tanstack/react-router";
import { ProductsPage } from "@/pages/ProductsPage";

export const Route = createFileRoute("/_app/products/")({
  head: () => ({ meta: [{ title: "Produtos — StockControl" }] }),
  component: ProductsPage,
});
