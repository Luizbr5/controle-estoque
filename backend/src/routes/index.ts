import { Router } from "express";
import { authRouter } from "./auth.routes";
import { categoryRouter } from "./category.routes";
import { productRouter } from "./product.routes";
import { stockMovementRouter } from "./stockMovement.routes";
import { dashboardRouter } from "./dashboard.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/stock-movements", stockMovementRouter);
apiRouter.use("/dashboard", dashboardRouter);
