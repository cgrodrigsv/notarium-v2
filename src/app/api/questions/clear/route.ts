import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request) {
  try {
    // Attempting to delete all questions. Since Prisma schema has onDelete: Cascade
    // on Options and AttemptDetails, this stringently cleans the bank.
    
    const deleteResult = await prisma.question.deleteMany({});
    
    return NextResponse.json({ 
      message: `Se eliminaron exitosamente ${deleteResult.count} preguntas del banco.` 
    }, { status: 200 });

  } catch (error) {
    console.error("Error al limpiar el banco de preguntas:", error);
    return NextResponse.json({ 
      error: "Hubo un error interno al intentar vaciar el banco de preguntas." 
    }, { status: 500 });
  }
}
