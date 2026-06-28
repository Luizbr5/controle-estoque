// Mock temporário em memória, espelhando exatamente o contrato oficial da API.
// Substituir por chamadas reais ao back-end removendo o flag USE_MOCK em api.ts.

import type {
  CategoryResponseDTO,
  ProductResponseDTO,
  StockMovementResponseDTO,
  UserResponseDTO,
} from "@/types/api";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

const now = () => new Date().toISOString();

export const mockUser: UserResponseDTO = {
  id: "a3f8c2e1-1234-4b56-9abc-def012345678",
  name: "Maria Silva",
  email: "maria@empresa.com",
  created_at: "2024-01-15T14:30:00.000Z",
};

export const categories: CategoryResponseDTO[] = [
  {
    id: "b1c2d3e4-5678-4abc-9def-012345678901",
    name: "Eletrônicos",
    description: "Equipamentos e acessórios eletrônicos",
    created_at: "2024-01-10T10:00:00.000Z",
    updated_at: "2024-01-10T10:00:00.000Z",
  },
  {
    id: "c2d3e4f5-6789-4bcd-aef0-123456789012",
    name: "Papelaria",
    description: null,
    created_at: "2024-01-10T10:05:00.000Z",
    updated_at: "2024-01-10T10:05:00.000Z",
  },
  {
    id: "d3e4f5a6-7890-4cde-bff0-234567890123",
    name: "Ferramentas",
    description: "Ferramentas manuais e elétricas",
    created_at: "2024-01-16T09:00:00.000Z",
    updated_at: "2024-01-16T09:00:00.000Z",
  },
];

export const products: ProductResponseDTO[] = [
  {
    id: "e4f5a6b7-8901-4def-c000-345678901234",
    category_id: categories[0].id,
    category: { id: categories[0].id, name: categories[0].name },
    name: "Cabo USB-C 2m",
    description: "Cabo de carregamento e dados USB-C",
    sku: "CAB-USBC-2M",
    price: 29.9,
    quantity: 3,
    min_quantity: 10,
    unit: "un",
    is_active: true,
    low_stock: true,
    image_url: null,
    created_at: "2024-01-12T11:00:00.000Z",
    updated_at: "2024-01-14T16:30:00.000Z",
  },
  {
    id: "f5a6b7c8-9012-4ef0-d111-456789012345",
    category_id: categories[0].id,
    category: { id: categories[0].id, name: categories[0].name },
    name: "Mouse Sem Fio",
    description: "Mouse wireless 2.4GHz com receptor USB",
    sku: "MSE-WL-001",
    price: 89.9,
    quantity: 50,
    min_quantity: 10,
    unit: "un",
    is_active: true,
    low_stock: false,
    image_url: null,
    created_at: "2024-01-16T10:00:00.000Z",
    updated_at: "2024-01-16T10:00:00.000Z",
  },
  {
    id: uid(),
    category_id: categories[1].id,
    category: { id: categories[1].id, name: categories[1].name },
    name: "Caneta Esferográfica Azul",
    description: "Caixa com 50 unidades",
    sku: "CAN-AZL-050",
    price: 45.0,
    quantity: 0,
    min_quantity: 5,
    unit: "cx",
    is_active: true,
    low_stock: true,
    image_url: null,
    created_at: "2024-02-01T08:00:00.000Z",
    updated_at: "2024-02-10T08:00:00.000Z",
  },
  {
    id: uid(),
    category_id: categories[2].id,
    category: { id: categories[2].id, name: categories[2].name },
    name: "Chave de Fenda 6mm",
    description: "Cabo emborrachado",
    sku: "CHV-FEN-6",
    price: 18.5,
    quantity: 120,
    min_quantity: 20,
    unit: "un",
    is_active: true,
    low_stock: false,
    image_url: null,
    created_at: "2024-02-05T08:00:00.000Z",
    updated_at: "2024-02-05T08:00:00.000Z",
  },
];

export const stockMovements: StockMovementResponseDTO[] = [
  {
    id: uid(),
    product_id: products[1].id,
    product: { id: products[1].id, name: products[1].name },
    user_id: mockUser.id,
    user: { id: mockUser.id, name: mockUser.name },
    type: "IN",
    quantity: 30,
    reason: "Recebimento de compra — NF 4521",
    product_quantity_after: 80,
    created_at: "2024-02-16T14:00:00.000Z",
  },
  {
    id: uid(),
    product_id: products[0].id,
    product: { id: products[0].id, name: products[0].name },
    user_id: mockUser.id,
    user: { id: mockUser.id, name: mockUser.name },
    type: "OUT",
    quantity: 7,
    reason: "Venda balcão",
    product_quantity_after: 3,
    created_at: "2024-02-18T09:30:00.000Z",
  },
  {
    id: uid(),
    product_id: products[3].id,
    product: { id: products[3].id, name: products[3].name },
    user_id: mockUser.id,
    user: { id: mockUser.id, name: mockUser.name },
    type: "ADJUSTMENT",
    quantity: 120,
    reason: "Inventário físico",
    product_quantity_after: 120,
    created_at: "2024-02-20T10:15:00.000Z",
  },
];

export function newId() {
  return uid();
}

export function timestamp() {
  return now();
}
