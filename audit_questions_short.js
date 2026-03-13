const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const allQuestions = await prisma.question.findMany({
    select: { legalBase: true }
  })
  
  const count = allQuestions.filter(q => 
    !q.legalBase || 
    q.legalBase.trim() === "" || 
    q.legalBase.toLowerCase().includes("sin especificar")
  ).length;

  console.log("PREGUNTAS_CON_ERROR:", count);
}

main().catch(console.error).finally(() => prisma.$disconnect())
