const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ['usuario01@notarium.com', 'usuario02@notarium.com', 'admin@notarium.com']
      }
    },
    select: {
      id: true,
      email: true,
      role: true,
      examsRemaining: true,
      _count: {
        select: { attempts: true }
      }
    }
  })

  console.log(JSON.stringify(users, null, 2))
  
  const recentAttempts = await prisma.attempt.findMany({
    take: 5,
    orderBy: { startedAt: 'desc' },
    select: {
      id: true,
      userId: true,
      mode: true,
      status: true,
      startedAt: true,
      user: {
        select: { email: true }
      }
    }
  })
  
  console.log("\nRecent Attempts:")
  console.log(JSON.stringify(recentAttempts, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
