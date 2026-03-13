const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, examsRemaining: true, role: true }
  })
  
  users.forEach(u => {
    console.log(`${u.email} (${u.role}): ${u.examsRemaining} credits`);
  })

  const lastAttempts = await prisma.attempt.findMany({
    take: 5,
    orderBy: { startedAt: 'desc' },
    include: { user: { select: { email: true } } }
  })

  console.log("\nLast 5 attempts:");
  lastAttempts.forEach(a => {
    console.log(`- ${a.user.email} | Mode: ${a.mode} | Status: ${a.status} | Time: ${a.startedAt}`);
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())
