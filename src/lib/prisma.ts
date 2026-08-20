let prismaClient: any = null;

export function getPrismaClient(): any {
  if (prismaClient) return prismaClient;

  try {
    const { PrismaClient } = require("@prisma/client");
    const { PrismaPg } = require("@prisma/adapter-pg");
    const { Pool } = require("pg");

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);

    prismaClient = new PrismaClient({ adapter });
  } catch (e) {
    console.error("Failed to initialize Prisma:", e);
    throw e;
  }

  return prismaClient;
}

export default { getPrismaClient };
