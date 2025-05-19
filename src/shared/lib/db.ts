import { PrismaClient } from "@prisma/client";

// Making Prisma work with Next.js with hot-reloading
declare global {
  //eslint-disable-next-line
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
