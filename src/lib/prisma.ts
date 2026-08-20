let prismaClient: any = null;

export function getPrismaClient(): any {
  if (prismaClient) return prismaClient;

  try {
    const { PrismaClient } = require("@prisma/client");
    const { PrismaNeon } = require("@prisma/adapter-neon");
    const { Pool } = require("@neondatabase/serverless");

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaNeon(pool);

    prismaClient = new PrismaClient({ adapter });
  } catch (e) {
    console.error("Failed to initialize Prisma:", e);
    throw e;
  }

  return prismaClient;
}

export default { getPrismaClient };
