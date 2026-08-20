let prismaClient: any = null;

export function getPrismaClient(): any {
  if (prismaClient) return prismaClient;

  const db_url = process.env.DATABASE_URL;
  if (!db_url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  try {
    const { PrismaClient } = require("@prisma/client");
    const { PrismaPg } = require("@prisma/adapter-pg");
    const adapter = new PrismaPg({ connectionString: db_url });
    prismaClient = new PrismaClient({ adapter });
  } catch (e) {
    const { PrismaClient } = require("@prisma/client");
    prismaClient = new PrismaClient();
  }

  return prismaClient;
}

export default { getPrismaClient };
