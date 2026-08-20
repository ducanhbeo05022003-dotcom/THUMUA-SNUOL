import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = [
    { username: "admin", name: "Administrator", password: "admin123", role: "ADMIN" as const },
    { username: "purchaser", name: "Purchaser", password: "user123", role: "PURCHASER" as const },
    { username: "approver", name: "Approver", password: "user123", role: "APPROVER" as const },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { username: u.username },
      update: { passwordHash, name: u.name, role: u.role, active: true },
      create: {
        username: u.username,
        name: u.name,
        passwordHash,
        role: u.role,
      },
    });
    console.log(`Seeded user: ${u.username}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
