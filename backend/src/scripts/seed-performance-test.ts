import { prisma } from "@/config/prisma";

async function main() {
  console.log("🌱 Iniciando seed de performance...");

  const company = await prisma.company.findFirst({ where: { slug: "minha-empresa" } });
  if (!company) {
    console.error("❌ Empresa 'minha-empresa' não encontrada");
    process.exit(1);
  }

  const user = await prisma.user.findFirst({
    where: { companyId: company.id, email: "maria@empresa.com" },
  });
  if (!user) {
    console.error("❌ Usuário não encontrado");
    process.exit(1);
  }

  // Criar categorias
  const categories = await Promise.all([
    prisma.category.create({
      data: { companyId: company.id, name: "Cat1", description: "Categoria 1" },
    }),
    prisma.category.create({
      data: { companyId: company.id, name: "Cat2", description: "Categoria 2" },
    }),
  ]);

  // Criar produtos em massa
  const products = Array.from({ length: 100 }, (_, i) => ({
    companyId: company.id,
    categoryId: categories[i % 2].id,
    name: `Produto ${i + 1}`,
    description: `Descrição do produto ${i + 1}`,
    sku: `SKU-${String(i + 1).padStart(5, "0")}`,
    price: Math.random() * 1000,
    quantity: Math.floor(Math.random() * 500),
    minQuantity: 10,
    unit: "un",
    isActive: true,
  }));

  await prisma.product.createMany({ data: products });
  console.log("✅ 100 produtos criados");

  // Criar movimentações
  const allProducts = await prisma.product.findMany({
    where: { companyId: company.id },
    take: 50,
  });

  const movements = allProducts.flatMap((p) =>
    Array.from({ length: 3 }, () => ({
      companyId: company.id,
      productId: p.id,
      userId: user.id,
      type: ["IN", "OUT", "ADJUSTMENT"][Math.floor(Math.random() * 3)] as "IN" | "OUT" | "ADJUSTMENT",
      quantity: Math.floor(Math.random() * 100) + 1,
      reason: "Teste",
      productQuantityAfter: Math.floor(Math.random() * 500),
    })),
  );

  await prisma.stockMovement.createMany({ data: movements });
  console.log("✅ Movimentações criadas");

  console.log("✨ Seed de performance finalizado!");
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });