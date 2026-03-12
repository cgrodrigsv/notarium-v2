import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// POST /api/auth/reset
// Body: { token, newPassword }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token y nueva contraseña son requeridos." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres." }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json({ error: "El enlace de recuperación no es válido." }, { status: 400 });
    }

    if (resetToken.used) {
      return NextResponse.json({ error: "Este enlace ya fue utilizado. Solicita uno nuevo." }, { status: 400 });
    }

    if (new Date() > new Date(resetToken.expiresAt)) {
      return NextResponse.json({ error: "El enlace ha expirado. Solicita uno nuevo." }, { status: 400 });
    }

    // Update password and mark token as used
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { token },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({ message: "Contraseña actualizada exitosamente. Ya puedes iniciar sesión." });

  } catch (error) {
    console.error("POST /api/auth/reset error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
