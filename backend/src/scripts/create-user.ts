import bcrypt from "bcrypt";
import { prisma } from "@/config/prisma";

const SALT_ROUNDS = 10;

async function main() {
  const args = process.argv.slice(2);
  const email = args[0];
  const companySlug = args.find((a) => a.startsWith("--company="))?.split("=")[1];
  const role = (args.find((a) => a.startsWith("--role="))?.split("=")[1] ?? "EMPLOYEE") as
    | "OWNER"
    | "ADMIN"
    | "EMPLOYEE";

  if (!email || !companySlug) {
    console.error("Uso: npx ts-node src/scripts/create-user.ts EMAIL --company=SLUG [--role=ROLE]");
    process.exit(1);
  }

  const company = await prisma.company.findUnique({ where: { slug: companySlug } });
  if (!company) {
    console.error(`❌ Empresa com slug "${companySlug}" não encontrada`);
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({
    where: { companyId_email: { companyId: company.id, email } },
  });
  if (existing) {
    console.error(`❌ Usuário com email "${email}" já existe nessa empresa`);
    process.exit(1);
  }

  const hashed = await bcrypt.hash("TempPassword123!", SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      companyId: company.id,
      name: email.split("@")[0],
      email,
      password: hashed,
      role,
    },
  });

  console.log(`✅ Usuário criado: ${user.name} (${user.email}) - Empresa: ${company.name}`);
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });