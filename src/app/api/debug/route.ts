import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const dbUrl = process.env.DATABASE_URL?.slice(0, 50) + '...';
    return NextResponse.json({ 
      ok: true, 
      userCount,
      dbUrlPreview: dbUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ 
      ok: false, 
      error: error.message 
    }, { status: 500 });
  }
}
