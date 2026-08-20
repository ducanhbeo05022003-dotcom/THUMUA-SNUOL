import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  const db_url = process.env.DATABASE_URL || "postgresql://localhost/dummy";

  let adapter: any;
  try {
    const { PrismaPg } = require("@prisma/adapter-pg");
    adapter = new PrismaPg({ connectionString: db_url });
  } catch (e) {
    // Build time - adapter not available, will fail at runtime if needed
  }

  return new PrismaClient(adapter ? { adapter } : {});
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export default prisma;
