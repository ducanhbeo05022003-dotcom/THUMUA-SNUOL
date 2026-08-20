let prismaClient: any = null;

export function getPrismaClient(): any {
  if (prismaClient) return prismaClient;

  try {
    const { PrismaClient } = require("@prisma/client");
    prismaClient = new PrismaClient();
  } catch (e) {
    console.error("Failed to initialize Prisma:", e);
    throw e;
  }

  return prismaClient;
}

export default { getPrismaClient };
