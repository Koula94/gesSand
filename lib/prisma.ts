import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    log: ["error", "warn"],
    errorFormat: "pretty",
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

prisma.$connect().catch((error) => {
  console.error("Failed to connect to the database:", error)
  process.exit(1)
})