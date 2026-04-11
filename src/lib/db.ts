import { PrismaClient } from '@prisma/client'

const dbUrl = process.env.DATABASE_URL || 'file:./db/custom.db'
const isTurso = dbUrl.startsWith('libsql://') || dbUrl.startsWith('https://')

function createDb(): PrismaClient {
  if (isTurso && process.env.TURSO_AUTH_TOKEN) {
    // Use /web entry point - HTTP only, no native modules, edge-compatible
    // @ts-expect-error - web entry point for edge runtime
    const { PrismaLibSQL } = require('@prisma/adapter-libsql/web')

    const adapter = new PrismaLibSQL({
      url: dbUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    return new PrismaClient({ adapter })
  }

  // Local file-based SQLite (dev mode)
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? createDb()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
