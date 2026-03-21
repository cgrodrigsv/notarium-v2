import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El correo electrónico ya está registrado." },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user (assigning TRIAL plan by default if it exists)
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        role: "USER",
        planType: "TRIAL",
        practicesRemaining: 1,
        examsRemaining: 1,
        simulationsRemaining: 1,
        trialExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
      },
    });

    return NextResponse.json(
      { message: "Usuario registrado con éxito.", user: { email: newUser.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { error: "Error al crear el usuario. Por favor intenta de nuevo." },
      { status: 500 }
    );
  }
}
