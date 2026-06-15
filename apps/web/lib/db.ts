import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neon } from "@neondatabase/serverless";

function createPrismaClient() {
  const sql = neon(process.env.DATABASE_URL!);
  const adapter = new PrismaNeon(sql);
  return new PrismaClient({ adapter });
}

// Singleton to avoid multiple Prisma Client instances during Next.js dev hot-reload
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Raw Neon SQL tag — use for one-off queries or full-text search that benefit from
// the HTTP driver's edge-compatible fetch transport directly.
export const sql = neon(process.env.DATABASE_URL!);
