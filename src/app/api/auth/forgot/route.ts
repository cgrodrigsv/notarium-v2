import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/auth/forgot
// Body: { email }
// Creates a reset token and returns the reset link (for admin to share)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "El correo es requerido." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // We always return success to avoid user enumeration attacks
    if (!user) {
      return NextResponse.json({ message: "Si el correo existe, un administrador podrá generar el enlace de recuperación." });
    }

    // Invalidate any previous unused tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    // Create new token, valid for 2 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    const resetToken = await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        expiresAt,
      }
    });

    return NextResponse.json({
      message: "Token generado exitosamente.",
      token: resetToken.token,
      expiresAt: resetToken.expiresAt,
    });

  } catch (error) {
    console.error("POST /api/auth/forgot error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
