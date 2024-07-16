import { PrismaClient } from "@prisma/client";

// code for connecting prisma properly with nextjs
const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined;
}

export const prisma = 
    globalForPrisma.prisma ?? 
    new PrismaClient({
        log: ['query'],
    })

if (process.env.NODE_ENV !== 'production') globalForPrisma.
prisma = prisma