import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users/[id]/plan — Fetch a user's plan info for the panel display
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        planType: true,
        examsRemaining: true,
        trialExpiresAt: true,
        role: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/users/[id]/plan error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
