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

    // 0. Connectivity Check & Fetch User
    console.log("Fetching user...");
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true, examsRemaining: true, practicesRemaining: true, simulationsRemaining: true, trialExpiresAt: true, role: true }
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

      // Check specific credits based on mode
      if (mode === "SIMULATION") {
        if (user.simulationsRemaining <= 0) {
          return NextResponse.json({
            error: "Has agotado tus simulacros reales. Contacta al administrador para recargar tu plan."
          }, { status: 403 });
        }
      } else if (mode === "PRACTICE") {
        if (user.practicesRemaining <= 0) {
          return NextResponse.json({
            error: "Has agotado tus prácticas guiadas. Verifica que tienes crédito disponible para esta modalidad."
          }, { status: 403 });
        }
      } else {
        // EXAM
        if (user.examsRemaining <= 0) {
          return NextResponse.json({
            error: "Has agotado tus exámenes estándar. Contacta al administrador para recargar tu plan."
          }, { status: 403 });
        }
      }
    }

    // 1. Get 20 random active questions
    // In PostgreSQL, identifiers are case-sensitive if quoted, and Prisma usually quotes them.
    console.log("Fetching random questions...");
    const randomQuestionsIds: { id: string }[] = await prisma.$queryRaw`
      SELECT id FROM "Question" WHERE "isActive" = true ORDER BY RANDOM() LIMIT 20;
    `;

    console.log(`Found ${randomQuestionsIds.length} random questions.`);

    if (randomQuestionsIds.length < 20) {
      console.warn("Not enough active questions found.");
      return NextResponse.json(
        { error: `No hay suficientes preguntas activas en el banco (encontradas: ${randomQuestionsIds.length}, mínimo 20).` },
        { status: 400 }
      );
    }

    // 2. Fetch the full questions with options but WITHOUT isCorrect attribute
    console.log("Fetching question details...");
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

    console.log(`Fetched details for ${questions.length} questions.`);

      // 3. Create Attempt and decrement examsRemaining
    console.log("Creating attempt and updating user...");
    const [attempt] = await prisma.$transaction([
      prisma.attempt.create({
        data: { userId, mode, status: "IN_PROGRESS" },
      }),
      // Decrement correct counter for non-admin users
      ...(user.role !== "ADMIN" ? [
        prisma.user.update({
          where: { id: userId },
          data: mode === "SIMULATION" 
            ? { simulationsRemaining: { decrement: 1 } }
            : mode === "PRACTICE" 
              ? { practicesRemaining: { decrement: 1 } }
              : { examsRemaining: { decrement: 1 } },
        })
      ] : [])
    ]);

    console.log(`Attempt created: ${attempt.id}`);

    return NextResponse.json({
      attemptId: attempt.id,
      questions,
    });
  } catch (error: any) {
    console.error("POST /api/exams/generate error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}
