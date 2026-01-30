import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

// In Prisma 7, we must pass the URL here because it's gone from the schema
export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;