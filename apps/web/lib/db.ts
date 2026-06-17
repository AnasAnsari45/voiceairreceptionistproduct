import { PrismaClient } from "@prisma/client/edge";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neon } from "@neondatabase/serverless";

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
}

// Each Cloudflare Worker invocation is a fresh isolate — no persistent globals.
// The singleton guard is here only for Next.js local dev hot-reload.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Raw Neon HTTP tag for one-off edge queries that don't need Prisma
export function getSql() {
  return neon(process.env.DATABASE_URL!);
}
