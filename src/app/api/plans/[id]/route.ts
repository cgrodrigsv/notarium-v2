import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.pricingOffer.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ message: "Plan eliminado." });
  } catch (error) {
    return NextResponse.json({ error: "No se pudo eliminar el plan." }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const updated = await prisma.pricingOffer.update({
      where: { id: params.id },
      data: {
        ...data,
        price: data.price ? parseFloat(data.price) : undefined,
        examsAmount: data.examsAmount ? parseInt(data.examsAmount) : undefined
      }
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "No se pudo actualizar el plan." }, { status: 500 });
  }
}
