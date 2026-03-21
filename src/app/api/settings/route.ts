import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    // Convert array of {key, value} to simply { [key]: value }
    const formatted = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: "No se pudieron cargar las configuraciones." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json(); // Expected: { key1: value1, key2: value2 }
    
    // We update or create each key
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string") {
        await prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value }
        });
      }
    }
    return NextResponse.json({ message: "Configuraciones guardadas exitosamente." });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Error al guardar configuraciones." }, { status: 500 });
  }
}
