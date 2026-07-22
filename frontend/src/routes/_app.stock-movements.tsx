import { createFileRoute } from "@tanstack/react-router";
import { StockMovementsPage } from "@/pages/StockMovementsPage";

export const Route = createFileRoute("/_app/stock-movements")({
  head: () => ({ meta: [{ title: "Movimentações — StockControl" }] }),
  component: StockMovementsPage,
});
