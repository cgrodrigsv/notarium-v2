import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalUsers, totalExams, attempts] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.attempt.count({ where: { status: "COMPLETED" } }),
      prisma.attempt.findMany({
        where: { status: "COMPLETED" },
        select: { percentage: true }
      })
    ]);

    const averageScore = attempts.length > 0
      ? (attempts.reduce((acc: any, curr: any) => acc + curr.percentage, 0) / attempts.length).toFixed(1)
      : "0.0";

    return NextResponse.json({
      totalUsers,
      totalExams,
      averageScore: `${averageScore}%`
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al cargar métricas" },
      { status: 500 }
    );
  }
}
