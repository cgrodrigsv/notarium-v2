import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const mode = body.mode || "EXAM";
    const userId = body.userId; // in a real app, from NextAuth session token

    if (!userId) {
      return NextResponse.json({ error: "Usuario no autenticado." }, { status: 401 });
    }

    // Check user's plan/license
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true, examsRemaining: true, trialExpiresAt: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    // ADMINs bypass all restrictions
    if (user.role !== "ADMIN") {
      if (user.planType === "NONE") {
        return NextResponse.json({
          error: "No tienes un plan activo. Contacta al administrador para habilitar tu acceso."
        }, { status: 403 });
      }

      if (user.planType === "TRIAL" && user.trialExpiresAt && new Date() > new Date(user.trialExpiresAt)) {
        return NextResponse.json({
          error: "Tu periodo de prueba ha expirado. Contacta al administrador para adquirir un plan."
        }, { status: 403 });
      }

      if (user.examsRemaining <= 0) {
        return NextResponse.json({
          error: "Has agotado tus exámenes disponibles. Contacta al administrador para recargar tu plan."
        }, { status: 403 });
      }
    }

    // 1. Get 20 random active questions
    // Since prisma does not have native ORDER BY RANDOM(), we can fetch IDs and pick random
    // or use $queryRaw. Since it's sqlite and for local development, raw query is fine:
    const randomQuestionsIds: { id: string }[] = await prisma.$queryRaw`
      SELECT id FROM Question WHERE isActive = true ORDER BY RANDOM() LIMIT 20;
    `;

    if (randomQuestionsIds.length < 20) {
      return NextResponse.json(
        { error: "No hay suficientes preguntas activas en el banco (mínimo 20)." },
        { status: 400 }
      );
    }

    // 2. Fetch the full questions with options but WITHOUT isCorrect attribute
    const questions = await prisma.question.findMany({
      where: {
        id: {
          in: randomQuestionsIds.map(q => q.id),
        },
      },
      select: {
        id: true,
        statement: true,
        legalBase: mode === "PRACTICE" ? true : false,
        options: {
          select: {
            id: true,
            text: true,
            orderLetter: true,
          },
        },
      },
    });

    // 3. Create Attempt and decrement examsRemaining
    const [attempt] = await prisma.$transaction([
      prisma.attempt.create({
        data: { userId, mode, status: "IN_PROGRESS" },
      }),
      // Only decrement for non-admin users with a plan
      ...(user.role !== "ADMIN" ? [
        prisma.user.update({
          where: { id: userId },
          data: { examsRemaining: { decrement: 1 } },
        })
      ] : [])
    ]);

    return NextResponse.json({
      attemptId: attempt.id,
      questions,
    });
  } catch (error) {
    console.error("POST /api/exams/generate error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
