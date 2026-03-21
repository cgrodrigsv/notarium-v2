import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// PUT /api/users/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { email, role, isActive, password, planType, planName, examsRemaining, practicesRemaining, simulationsRemaining, trialExpiresAt } = body;

    const dataToUpdate: any = {};

    if (email !== undefined) dataToUpdate.email = email;
    if (role !== undefined) dataToUpdate.role = role;
    if (isActive !== undefined) dataToUpdate.isActive = isActive;
    if (planType !== undefined) dataToUpdate.planType = planType;
    if (planName !== undefined) dataToUpdate.planName = planName;
    if (examsRemaining !== undefined) dataToUpdate.examsRemaining = examsRemaining;
    if (practicesRemaining !== undefined) dataToUpdate.practicesRemaining = practicesRemaining;
    if (simulationsRemaining !== undefined) dataToUpdate.simulationsRemaining = simulationsRemaining;
    if (trialExpiresAt !== undefined) dataToUpdate.trialExpiresAt = trialExpiresAt;
    
    if (password) {
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PUT /api/users/[id] error:", error);
    return NextResponse.json({ error: "Error al actualizar el usuario" }, { status: 500 });
  }
}
