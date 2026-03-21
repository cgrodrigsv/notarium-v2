import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Fetch all active plans for public/users
export async function GET() {
  try {
    const plans = await prisma.pricingOffer.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" }
    });
    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json({ error: "Error al cargar planes." }, { status: 500 });
  }
}

// POST: Admin creates a new plan
export async function POST(request: Request) {
  try {
    const { name, description, price, examsAmount, practicesAmount, simulationsAmount } = await request.json();
    
    const newPlan = await prisma.pricingOffer.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        examsAmount: parseInt(examsAmount) || 0,
        practicesAmount: parseInt(practicesAmount) || 0,
        simulationsAmount: parseInt(simulationsAmount) || 0
      }
    });

    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear plan." }, { status: 500 });
  }
}
