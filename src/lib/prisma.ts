import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const hasDatabase = !!process.env.DATABASE_URL;

  if (!isProduction || !hasDatabase) {
    return new PrismaClient();
  }

  const { PrismaPg } = require("@prisma/adapter-pg");
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export default prisma;
