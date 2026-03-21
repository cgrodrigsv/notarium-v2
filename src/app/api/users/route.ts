import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// GET /api/users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        planType: true,
        examsRemaining: true,
        practicesRemaining: true,
        simulationsRemaining: true,
        trialExpiresAt: true,
        createdAt: true,
      }
      // Note: we don't select passwordHash
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Error intenro del servidor" }, { status: 500 });
  }
}

// POST /api/users
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role, isActive, planType, planName, examsRemaining, practicesRemaining, simulationsRemaining, trialExpiresAt } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son obligatorios" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "El correo ya está registrado" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role || "USER",
        isActive: isActive !== undefined ? isActive : true,
        planType: planType || "NONE",
        planName: planName || null,
        examsRemaining: examsRemaining || 0,
        practicesRemaining: practicesRemaining || 0,
        simulationsRemaining: simulationsRemaining || 0,
        trialExpiresAt: trialExpiresAt || null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        planType: true,
        examsRemaining: true,
        practicesRemaining: true,
        trialExpiresAt: true,
        createdAt: true,
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
