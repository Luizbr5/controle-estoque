import bcrypt from "bcrypt";
import { prisma } from "../src/config/prisma";

const SALT_ROUNDS = 10;

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // 1. Criar empresa padrão
  const company = await prisma.company.upsert({
    where: { slug: "minha-empresa" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Minha Empresa",
      slug: "minha-empresa",
    },
  });
  console.log(`✅ Empresa criada: ${company.name}`);


  // 2. Criar usuário padrão
  const hashedPassword = await bcrypt.hash("senha123", SALT_ROUNDS);
  const user = await prisma.user.upsert({
    where: { companyId_email: { companyId: company.id, email: "maria@empresa.com" } },
    update: {},
    create: {
      companyId: company.id,
      name: "Maria Silva",
      email: "maria@empresa.com",
      password: hashedPassword,
      role: "OWNER",
    },
  });
  console.log(`✅ Usuário criado: ${user.name} (${user.email})`);

  // 3. Criar categorias
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { companyId_name: { companyId: company.id, name: "Eletrônicos" } },
      update: {},
      create: {
        companyId: company.id,
        name: "Eletrônicos",
        description: "Produtos eletrônicos em geral",
      },
    }),
    prisma.category.upsert({
      where: { companyId_name: { companyId: company.id, name: "Papelaria" } },
      update: {},
      create: {
        companyId: company.id,
        name: "Papelaria",
        description: "Produtos de papelaria",
      },
    }),
    prisma.category.upsert({
      where: { companyId_name: { companyId: company.id, name: "Periféricos" } },
      update: {},
      create: {
        companyId: company.id,
        name: "Periféricos",
        description: "Periféricos de computador",
      },
    }),
  ]);
  console.log(`✅ ${categories.length} categorias criadas`);

  // 4. Criar produtos
  const products = await Promise.all([
    prisma.product.upsert({
      where: { companyId_sku: { companyId: company.id, sku: "CABO-USB-C-2M" } },
      update: {},
      create: {
        companyId: company.id,
        categoryId: categories[2].id,
        name: "Cabo USB-C 2m",
        description: "Cabo USB-C de alta qualidade",
        sku: "CABO-USB-C-2M",
        price: 35.9,
        quantity: 50,
        minQuantity: 10,
        unit: "un",
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { companyId_sku: { companyId: company.id, sku: "CANETA-ESFEROGR-AZUL" } },
      update: {},
      create: {
        companyId: company.id,
        categoryId: categories[1].id,
        name: "Caneta Esferográfica Azul",
        description: "Caneta azul com ponta fina",
        sku: "CANETA-ESFEROGR-AZUL",
        price: 2.5,
        quantity: 200,
        minQuantity: 50,
        unit: "un",
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { companyId_sku: { companyId: company.id, sku: "MOUSE-WIRELESS" } },
      update: {},
      create: {
        companyId: company.id,
        categoryId: categories[0].id,
        name: "Mouse Wireless",
        description: "Mouse sem fio ergonômico",
        sku: "MOUSE-WIRELESS",
        price: 89.9,
        quantity: 30,
        minQuantity: 5,
        unit: "un",
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { companyId_sku: { companyId: company.id, sku: "TECLADO-MECANICO" } },
      update: {},
      create: {
        companyId: company.id,
        categoryId: categories[0].id,
        name: "Teclado Mecânico RGB",
        description: "Teclado mecânico com RGB",
        sku: "TECLADO-MECANICO",
        price: 250.0,
        quantity: 15,
        minQuantity: 3,
        unit: "un",
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ ${products.length} produtos criados`);

  // 5. Criar movimentações de estoque
  await Promise.all([
    prisma.stockMovement.create({
      data: {
        companyId: company.id,
        productId: products[0].id,
        userId: user.id,
        type: "IN",
        quantity: 50,
        reason: "Estoque inicial",
        productQuantityAfter: 50,
      },
    }),
    prisma.stockMovement.create({
      data: {
        companyId: company.id,
        productId: products[1].id,
        userId: user.id,
        type: "IN",
        quantity: 200,
        reason: "Estoque inicial",
        productQuantityAfter: 200,
      },
    }),
    prisma.stockMovement.create({
      data: {
        companyId: company.id,
        productId: products[2].id,
        userId: user.id,
        type: "IN",
        quantity: 30,
        reason: "Estoque inicial",
        productQuantityAfter: 30,
      },
    }),
  ]);
  console.log("✅ Movimentações de estoque criadas");

  console.log("\n✨ Seed finalizado com sucesso!\n");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });