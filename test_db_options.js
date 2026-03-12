const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOptions() {
  const questions = await prisma.question.findMany({
    include: { options: true },
    take: 5
  });

  for (const q of questions) {
    console.log(`Q: ${q.statement.substring(0, 50)}...`);
    console.log(`Options Count: ${q.options.length}`);
    for (const opt of q.options) {
      console.log(` - ${opt.orderLetter}: ${opt.text.substring(0, 50)}...`);
    }
  }
}

checkOptions();
