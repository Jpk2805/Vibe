import { PrismaClient } from '../generated/prisma/client'
import { PrismaNeonHttp } from '@prisma/adapter-neon'

const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {})

const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter,
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma