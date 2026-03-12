import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attemptId } = await params;
    
    // 1. Get attempt info
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { user: true }
    });

    if (!attempt) {
      return NextResponse.json({ error: "Intento no encontrado." }, { status: 404 });
    }

    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "No se puede cancelar un examen finalizado." }, { status: 400 });
    }

    // 2. Perform cancellation in transaction
    await prisma.$transaction(async (tx) => {
      // Refund if it was an EXAM and user is not ADMIN
      if (attempt.mode === "EXAM" && attempt.user.role !== "ADMIN") {
        await tx.user.update({
          where: { id: attempt.userId },
          data: { examsRemaining: { increment: 1 } }
        });
      }

      // Delete the attempt
      await tx.attempt.delete({
        where: { id: attemptId }
      });
    });

    return NextResponse.json({ message: "Examen cancelado y crédito devuelto." });
  } catch (error: any) {
    console.error("DELETE /api/exams/[id]/cancel error:", error);
    return NextResponse.json(
      { error: "Error interno al cancelar el examen", details: error.message },
      { status: 500 }
    );
  }
}
