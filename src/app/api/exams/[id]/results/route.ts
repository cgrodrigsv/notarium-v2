import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attemptId } = await params;

    if (!attemptId) {
      return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
    }

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        details: {
          include: {
            question: true,
            selectedOption: true,
          }
        }
      }
    });

    if (!attempt) {
      return NextResponse.json({ error: "Intento no encontrado." }, { status: 404 });
    }

    // We also need all options for all the questions in this attempt to render the summary
    const questionIds = attempt.details.map((d: any) => d.questionId);
    
    const allOptions = await prisma.option.findMany({
      where: {
        questionId: {
          in: questionIds
        }
      }
    });

    // We can group options by questionId for easier frontend consumption
    const optionsByQuestion = allOptions.reduce((acc: any, option: any) => {
      if (!acc[option.questionId]) {
        acc[option.questionId] = [];
      }
      acc[option.questionId].push(option);
      return acc;
    }, {});


    return NextResponse.json({
      attempt,
      optionsByQuestion
    });

  } catch (error) {
    console.error("GET /api/exams/[id]/results error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
