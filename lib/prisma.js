import { PrismaClient } from '@prisma/client'

// ✅ gunakan globalThis untuk cache Prisma Client agar tidak duplikat di Next.js
const globalForPrisma = globalThis

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'], // opsional
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
