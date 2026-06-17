import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neon, neonConfig } from "@neondatabase/serverless";

// Cloudflare Workers doesn't auto-detect the global WebSocket — set it explicitly.
// In local Node.js dev, Pool falls back to the 'ws' package automatically.
neonConfig.webSocketConstructor = WebSocket;

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
}

// Singleton guard for Next.js local dev hot-reload only.
// In Cloudflare Workers each isolate is fresh, so this has no effect there.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Raw Neon HTTP tag for one-off edge queries that don't need Prisma
export function getSql() {
  return neon(process.env.DATABASE_URL!);
}
