import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neon } from "@neondatabase/serverless";

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
}

// Singleton — avoids multiple Prisma Client instances during Next.js dev hot-reload
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Raw Neon SQL tag for edge-compatible one-off queries (Phase 2+)
export function getSql() {
  return neon(process.env.DATABASE_URL!);
}
