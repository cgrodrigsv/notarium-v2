import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

import path from 'path'
const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@notarium.com' },
    update: {},
    create: {
      email: 'admin@notarium.com',
      passwordHash: hash,
      role: 'ADMIN',
    },
  })

  const user = await prisma.user.upsert({
    where: { email: 'student@notarium.com' },
    update: {},
    create: {
      email: 'student@notarium.com',
      passwordHash: hash,
      role: 'USER',
    },
  })

  console.log({ admin, user })

  // Insert 20 fake questions to test Exam generation
  for (let i = 1; i <= 20; i++) {
    await prisma.question.create({
      data: {
        statement: `Pregunta de prueba ${i}: ¿Qué dice el código civil respecto a este caso judicial ficticio muy largo?`,
        legalBase: 'Art. 123 Código Civil',
        theme: 'Civil',
        difficulty: 'Media',
        options: {
          create: [
            { text: `Opción A (incorrecta) para la pregunta ${i}`, isCorrect: false, orderLetter: 'A' },
            { text: `Opción B (incorrecta) para la pregunta ${i}`, isCorrect: false, orderLetter: 'B' },
            { text: `Opción C (correcta) para la pregunta ${i}`, isCorrect: true, orderLetter: 'C' },
            { text: `Opción D (incorrecta) para la pregunta ${i}`, isCorrect: false, orderLetter: 'D' },
          ]
        }
      }
    })
  }

  console.log("Seeding completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
