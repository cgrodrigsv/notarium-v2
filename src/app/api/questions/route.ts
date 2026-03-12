import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        skip,
        take: limit,
        include: {
          options: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.question.count(),
    ]);

    return NextResponse.json({
      data: questions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/questions error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // basic validation
    if (!body.statement || !body.legalBase || !Array.isArray(body.options) || body.options.length !== 4) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios o el formato de opciones no es correcto (deben ser 4)." },
        { status: 400 }
      );
    }

    const { statement, legalBase, options, difficulty, theme } = body;

    const correctOptions = options.filter((opt: any) => opt.isCorrect === true || opt.isCorrect === 1.0);
    if (correctOptions.length !== 1) {
      return NextResponse.json(
        { error: "Debe haber exactamente una opción correcta." },
        { status: 400 }
      );
    }

    const question = await prisma.question.create({
      data: {
        statement,
        legalBase,
        difficulty,
        theme,
        options: {
          create: options.map((opt: any, idx: number) => ({
            text: opt.text,
            isCorrect: opt.isCorrect === true || opt.isCorrect === 1.0,
            orderLetter: String.fromCharCode(65 + idx), // A, B, C, D
          })),
        },
      },
      include: {
        options: true,
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("POST /api/questions error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
