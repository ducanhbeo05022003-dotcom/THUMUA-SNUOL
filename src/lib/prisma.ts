let prismaClient: any = null;

export function getPrismaClient(): any {
  if (prismaClient) return prismaClient;

  try {
    const { PrismaClient } = require("@prisma/client");
    const { PrismaNeon } = require("@prisma/adapter-neon");
    const { neon } = require("@neondatabase/serverless");

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    const sql = neon(databaseUrl);
    const adapter = new PrismaNeon(sql);

    prismaClient = new PrismaClient({ adapter });
    console.log("Prisma client initialized with Neon adapter");
  } catch (e: any) {
    console.error("Failed to initialize Prisma:", e?.message || String(e));
    throw e;
  }

  return prismaClient;
}

export default { getPrismaClient };
