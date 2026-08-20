let prismaClient: any = null;

export function getPrismaClient(): any {
  if (prismaClient) return prismaClient;

  try {
    const { PrismaClient } = require("@prisma/client");
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    prismaClient = new PrismaClient({
      datasourceUrl: databaseUrl,
    });
  } catch (e) {
    console.error("Failed to initialize Prisma:", e);
    throw e;
  }

  return prismaClient;
}

export default { getPrismaClient };
