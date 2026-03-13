const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const allQuestions = await prisma.question.findMany({
    select: { id: true, legalBase: true, statement: true }
  })
  
  const missing = allQuestions.filter(q => 
    !q.legalBase || 
    q.legalBase.trim() === "" || 
    q.legalBase.toLowerCase().includes("sin especificar")
  );

  console.log("Total preguntas:", allQuestions.length);
  console.log("Preguntas con problemas de base legal:", missing.length);
  console.log("\nEjemplos para depurar:");
  missing.slice(0, 10).forEach((q, i) => {
    console.log(`${i+1}. [ID: ${q.id}] [Base: ${q.legalBase}] ${q.statement.substring(0, 80)}...`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect())
