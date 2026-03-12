import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL || "";
    const unpooledUrl = process.env.DATABASE_URL_UNPOOLED || "";
    
    // Check if variables are present and their lengths
    const status = {
      hasDbUrl: !!dbUrl,
      dbUrlLength: dbUrl.length,
      hasUnpooled: !!unpooledUrl,
      unpooledLength: unpooledUrl.length,
      nodeEnv: process.env.NODE_ENV,
    };

    const userCount = await prisma.user.count();
    
    return NextResponse.json({ 
      ok: true, 
      status,
      userCount
    });
  } catch (error: any) {
    const dbUrl = process.env.DATABASE_URL || "";
    return NextResponse.json({ 
      ok: false, 
      status: {
        dbUrlLength: dbUrl.length,
        hasDbUrl: !!dbUrl,
      },
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 3)
    }, { status: 500 });
  }
}
