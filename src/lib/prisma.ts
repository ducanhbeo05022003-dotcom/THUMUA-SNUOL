let prismaClient: any = null;

export function getPrismaClient(): any {
  if (prismaClient) return prismaClient;

  const db_url = process.env.DATABASE_URL;

  try {
    const { PrismaClient } = require("@prisma/client");

    if (!db_url) {
      // Build time or no DATABASE_URL - return dummy client
      prismaClient = new PrismaClient();
      return prismaClient;
    }

    try {
      const { PrismaPg } = require("@prisma/adapter-pg");
      const adapter = new PrismaPg({ connectionString: db_url });
      prismaClient = new PrismaClient({ adapter });
    } catch (adapterError) {
      // Adapter fail - fallback to vanilla client
      prismaClient = new PrismaClient();
    }
  } catch (e) {
    console.error("Failed to initialize Prisma:", e);
    throw e;
  }

  return prismaClient;
}

export default { getPrismaClient };
