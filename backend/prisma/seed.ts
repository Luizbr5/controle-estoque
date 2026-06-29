/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const SEED_USER_PASSWORD = "senha123";

async function main(): Promise<void> {
  console.log("🌱 Iniciando seed...");

  const hashed = await bcrypt.hash(SEED_USER_PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: "maria@empresa.com" },
    update: {},
    create: { name: "Maria Silva", email: "maria@empresa.com", password: hashed },
  });

  const [eletronicos, papelaria, ferramentas] = await Promise.all([
    prisma.category.upsert({
      where: { id: "b1c2d3e4-5678-4abc-9def-012345678901" },
      update: {},
      create: {
        id: "b1c2d3e4-5678-4abc-9def-012345678901",
        name: "Eletrônicos",
        description: "Equipamentos e acessórios eletrônicos",
      },
    }),
    prisma.category.upsert({
      where: { id: "c2d3e4f5-6789-4bcd-aef0-123456789012" },
      update: {},
      create: { id: "c2d3e4f5-6789-4bcd-aef0-123456789012", name: "Papelaria", description: null },
    }),
    prisma.category.upsert({
      where: { id: "d3e4f5a6-7890-4cde-bff0-234567890123" },
      update: {},
      create: {
        id: "d3e4f5a6-7890-4cde-bff0-234567890123",
        name: "Ferramentas",
        description: "Ferramentas manuais e elétricas",
      },
    }),
  ]);

  const cabo = await prisma.product.upsert({
    where: { sku: "CAB-USBC-2M" },
    update: {},
    create: {
      categoryId: eletronicos.id,
      name: "Cabo USB-C 2m",
      description: "Cabo de carregamento e dados USB-C",
      sku: "CAB-USBC-2M",
      price: 29.9,
      quantity: 3,
      minQuantity: 10,
      unit: "un",
    },
  });

  const mouse = await prisma.product.upsert({
    where: { sku: "MSE-WL-001" },
    update: {},
    create: {
      categoryId: eletronicos.id,
      name: "Mouse Sem Fio",
      description: "Mouse wireless 2.4GHz com receptor USB",
      sku: "MSE-WL-001",
      price: 89.9,
      quantity: 50,
      minQuantity: 10,
      unit: "un",
    },
  });

  const caneta = await prisma.product.upsert({
    where: { sku: "CAN-AZL-050" },
    update: {},
    create: {
      categoryId: papelaria.id,
      name: "Caneta Esferográfica Azul",
      description: "Caixa com 50 unidades",
      sku: "CAN-AZL-050",
      price: 45.0,
      quantity: 0,
      minQuantity: 5,
      unit: "cx",
    },
  });

  const chave = await prisma.product.upsert({
    where: { sku: "CHV-FEN-6" },
    update: {},
    create: {
      categoryId: ferramentas.id,
      name: "Chave de Fenda 6mm",
      description: "Cabo emborrachado",
      sku: "CHV-FEN-6",
      price: 18.5,
      quantity: 120,
      minQuantity: 20,
      unit: "un",
    },
  });

  const existingMovements = await prisma.stockMovement.count();
  if (existingMovements === 0) {
    await prisma.stockMovement.createMany({
      data: [
        {
          productId: mouse.id,
          userId: user.id,
          type: "IN",
          quantity: 30,
          reason: "Recebimento de compra — NF 4521",
          productQuantityAfter: 80,
        },
        {
          productId: cabo.id,
          userId: user.id,
          type: "OUT",
          quantity: 7,
          reason: "Venda balcão",
          productQuantityAfter: 3,
        },
        {
          productId: chave.id,
          userId: user.id,
          type: "ADJUSTMENT",
          quantity: 120,
          reason: "Inventário físico",
          productQuantityAfter: 120,
        },
      ],
    });
  }

  console.log("✅ Seed concluído.");
  console.log(`   Usuário de teste: maria@empresa.com / senha: ${SEED_USER_PASSWORD}`);
  console.log(`   Produtos: ${[cabo, mouse, caneta, chave].length} | Categorias: 3`);
}

main()
  .catch((err) => {
    console.error("❌ Erro ao executar o seed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
