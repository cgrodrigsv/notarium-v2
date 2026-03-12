import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();

    if (!body.statement || !body.legalBase || !Array.isArray(body.options) || body.options.length !== 4) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios o el formato de opciones no es correcto." },
        { status: 400 }
      );
    }

    const { statement, legalBase, options, difficulty, theme, isActive } = body;

    const correctOptions = options.filter((opt: { isCorrect: unknown }) => opt.isCorrect === true || opt.isCorrect === 1.0);
    if (correctOptions.length !== 1) {
      return NextResponse.json(
        { error: "Debe haber exactamente una opción correcta." },
        { status: 400 }
      );
    }

    // Update the question
    await prisma.question.update({
      where: { id },
      data: {
        statement,
        legalBase,
        difficulty,
        theme,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    // Update options. We need to delete old ones and recreate to avoid ID mismatches
    // since the quantity is small and they belong uniquely to this question
    await prisma.option.deleteMany({
      where: { questionId: id }
    });

    await prisma.option.createMany({
      data: options.map((opt: { text: string; isCorrect: unknown }, idx: number) => ({
        questionId: id,
        text: opt.text,
        isCorrect: opt.isCorrect === true || opt.isCorrect === 1.0,
        orderLetter: String.fromCharCode(65 + idx), // A, B, C, D
      }))
    });

    const finalQuestion = await prisma.question.findUnique({
      where: { id },
      include: { options: true }
    });

    return NextResponse.json(finalQuestion, { status: 200 });
  } catch (error) {
    console.error(`PUT /api/questions/[id] error:`, error);
    return NextResponse.json(
      { error: "Error interno del servidor al actualizar la pregunta." },
      { status: 500 }
    );
  }
}
