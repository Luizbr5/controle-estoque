import { prisma } from "../src/config/prisma";

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");
  console.log("📝 Para criar sua primeira conta, acesse http://localhost:5173\n");

  // Nota importante: Usuários e empresas devem ser criados via UI
  // para manter as credenciais seguras. Este seed apenas prepara
  // estruturas de dados de exemplo quando necessário.

  console.log("✨ Banco pronto para uso!");
  console.log("\nPróximos passos:");
  console.log("1. Acesse http://localhost:5173");
  console.log("2. Clique em 'Criar Conta'");
  console.log("3. Preencha com seus dados");
  console.log("4. Comece a usar o sistema!\n");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });