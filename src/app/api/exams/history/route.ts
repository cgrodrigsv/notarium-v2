import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Usuario no especificado." }, { status: 400 });
    }

    const attempts = await prisma.attempt.findMany({
      where: {
        userId: userId,
        status: "COMPLETED"
      },
      orderBy: {
        startedAt: "desc"
      },
      take: 10
    });

    return NextResponse.json({ data: attempts });

  } catch (error) {
    console.error("GET /api/exams/history error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
