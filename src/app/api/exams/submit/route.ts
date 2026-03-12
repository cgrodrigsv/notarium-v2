import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { attemptId, answers } = body; 
    // answers should be record/object: { [questionId: string]: selectedOptionId }

    if (!attemptId || !answers || typeof answers !== 'object') {
      return NextResponse.json({ error: "Faltan datos de envío." }, { status: 400 });
    }

    // Retrieve attempt
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt || attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Intento no válido o ya finalizado." }, { status: 400 });
    }

    // Retrieve the actual correct options for validation
    const questionIds = Object.keys(answers);
    const options = await prisma.option.findMany({
      where: {
        questionId: {
          in: questionIds
        }
      }
    });

    let score = 0;
    const detailsData = [];

    for (const qId of questionIds) {
      const selectedOptionId = answers[qId];
      // Find the specific option the user selected and check if it's correct
      const isCorrect = options.some(opt => opt.id === selectedOptionId && opt.isCorrect);

      if (isCorrect) {
        score += 1;
      }

      detailsData.push({
        attemptId,
        questionId: qId,
        selectedOptionId,
        isCorrect
      });
    }

    const percentage = (score / 20) * 100; // Expected 20 questions

    // Save details and update attempt status transactionally
    await prisma.$transaction([
      prisma.attemptDetail.createMany({
        data: detailsData
      }),
      prisma.attempt.update({
        where: { id: attemptId },
        data: {
          score,
          percentage,
          status: "COMPLETED",
          completedAt: new Date()
        }
      })
    ]);

    return NextResponse.json({
      message: "Examen evaluado exitosamente.",
      score,
      percentage
    });

  } catch (error) {
    console.error("POST /api/exams/submit error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
