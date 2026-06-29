import swaggerJsdoc from "swagger-jsdoc";
import path from "node:path";
import { env } from "./env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Controle de Estoque — API",
      version: "2.0.0",
      description:
        "API oficial do sistema de controle de estoque. Toda rota documentada aqui é gerada " +
        "automaticamente a partir das anotações JSDoc presentes nos arquivos de rota.",
    },
    servers: [{ url: `http://localhost:${env.PORT}${env.API_PREFIX}`, description: "Local" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        ApiError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                code: { type: "string", example: "NOT_FOUND" },
                message: { type: "string", example: "Recurso não encontrado" },
                details: {},
              },
            },
          },
        },
        ApiMeta: {
          type: "object",
          properties: {
            total: { type: "integer" },
            page: { type: "integer" },
            limit: { type: "integer" },
            totalPages: { type: "integer" },
          },
        },
        UserResponseDTO: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        AuthPayload: {
          type: "object",
          properties: {
            user: { $ref: "#/components/schemas/UserResponseDTO" },
            token: { type: "string" },
          },
        },
        CategoryResponseDTO: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            description: { type: "string", nullable: true },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        ProductResponseDTO: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            category_id: { type: "string", format: "uuid", nullable: true },
            category: {
              type: "object",
              nullable: true,
              properties: { id: { type: "string" }, name: { type: "string" } },
            },
            name: { type: "string" },
            description: { type: "string", nullable: true },
            sku: { type: "string", nullable: true },
            price: { type: "number" },
            quantity: { type: "integer" },
            min_quantity: { type: "integer" },
            unit: { type: "string" },
            is_active: { type: "boolean" },
            low_stock: { type: "boolean" },
            image_url: { type: "string", nullable: true },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        StockMovementResponseDTO: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            product_id: { type: "string", format: "uuid" },
            product: {
              type: "object",
              properties: { id: { type: "string" }, name: { type: "string" } },
            },
            user_id: { type: "string", format: "uuid", nullable: true },
            user: {
              type: "object",
              nullable: true,
              properties: { id: { type: "string" }, name: { type: "string" } },
            },
            type: { type: "string", enum: ["IN", "OUT", "ADJUSTMENT"] },
            quantity: { type: "integer" },
            reason: { type: "string", nullable: true },
            product_quantity_after: { type: "integer" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        DashboardSummaryResponseDTO: {
          type: "object",
          properties: {
            total_products: { type: "integer" },
            active_products: { type: "integer" },
            low_stock_count: { type: "integer" },
            out_of_stock_count: { type: "integer" },
            total_categories: { type: "integer" },
            total_stock_value: { type: "number" },
            movements_today: { type: "integer" },
            movements_this_month: { type: "integer" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [path.join(__dirname, "..", "routes", "*.{ts,js}")],
};

export const swaggerSpec = swaggerJsdoc(options);
