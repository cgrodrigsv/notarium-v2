import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const hash = await bcrypt.hash('password123', 10);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@notarium.com' },
      update: {},
      create: {
        email: 'admin@notarium.com',
        passwordHash: hash,
        role: 'ADMIN',
      },
    });

    const user = await prisma.user.upsert({
      where: { email: 'student@notarium.com' },
      update: {},
      create: {
        email: 'student@notarium.com',
        passwordHash: hash,
        role: 'USER',
      },
    });

    // Seeding 20 questions
    for (let i = 1; i <= 20; i++) {
        // Only insert if missing (simplistic check for seed)
        const count = await prisma.question.count();
        if (count >= 20) break;

        await prisma.question.create({
        data: {
            statement: `Pregunta de prueba ${i}: ¿Qué establece la Ley Orgánica del Notariado frente a la responsabilidad civil y penal en el ejercicio de las funciones públicas?`,
            legalBase: 'Art. 12 y siguientes de la Ley Orgánica de Notariado',
            theme: 'Derecho Notarial',
            difficulty: 'Media',
            options: {
            create: [
                { text: `Falso inciso ${i}-A: establece exención total.`, isCorrect: false, orderLetter: 'A' },
                { text: `Falso inciso ${i}-B: solo responsabilidad penal en casos graves.`, isCorrect: false, orderLetter: 'B' },
                { text: `Correcto inciso ${i}-C: establece responsabilidad civil, penal y administrativa ineludible.`, isCorrect: true, orderLetter: 'C' },
                { text: `Falso inciso ${i}-D: el notario está exento si alega ignorancia.`, isCorrect: false, orderLetter: 'D' },
            ]
            }
        }
        })
    }

    return NextResponse.json({ message: "Seed completado exitosamente con admin@notarium.com y student@notarium.com. 20 preguntas generadas." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error en el seed." }, { status: 500 });
  }
}
