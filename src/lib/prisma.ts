let prismaClient: any = null;

export function getPrismaClient(): any {
  if (prismaClient) return prismaClient;

  try {
    const { PrismaClient } = require("@prisma/client");

    const databaseUrl = process.env.DATABASE_URL;
    console.log("DATABASE_URL available:", !!databaseUrl);
    console.log("DATABASE_URL starts with:", databaseUrl?.substring(0, 20));

    prismaClient = new PrismaClient();
    console.log("Prisma client initialized successfully");
  } catch (e: any) {
    console.error("Failed to initialize Prisma:", e?.message || e);
    throw e;
  }

  return prismaClient;
}

export default { getPrismaClient };
