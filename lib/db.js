// Prisma client singleton.
//
// The client is generated to a custom output directory
// (lib/generated/prisma — see prisma/schema.prisma) and imported as a
// project module. This avoids the stale node_modules/.prisma resolution
// issues that occur with Next.js bundlers in this environment.
import { PrismaClient } from "./generated/prisma/default.js";

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
