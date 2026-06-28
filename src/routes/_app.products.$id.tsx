import { createFileRoute } from "@tanstack/react-router";
import { ProductDetailPage } from "@/pages/ProductDetailPage";

export const Route = createFileRoute("/_app/products/$id")({
  head: () => ({ meta: [{ title: "Produto — StockControl" }] }),
  component: ProductDetailPage,
});
