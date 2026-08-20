import { PrismaClient } from "@prisma/client";

let prismaClient: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (prismaClient) return prismaClient;

  const db_url = process.env.DATABASE_URL;
  if (!db_url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  try {
    const { PrismaPg } = require("@prisma/adapter-pg");
    const adapter = new PrismaPg({ connectionString: db_url });
    prismaClient = new PrismaClient({ adapter });
  } catch (e) {
    prismaClient = new PrismaClient();
  }

  return prismaClient;
}

export default { getPrismaClient };
