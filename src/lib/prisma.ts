import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  if (!process.env.DATABASE_URL) {
    return new PrismaClient();
  }

  try {
    const { PrismaPg } = require("@prisma/adapter-pg");
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    return new PrismaClient({ adapter });
  } catch {
    return new PrismaClient();
  }
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export default prisma;
