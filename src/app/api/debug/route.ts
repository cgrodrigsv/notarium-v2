import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL || "";
    const unpooledUrl = process.env.DATABASE_URL_UNPOOLED || "";
    
    // Detailed inspection without exposing the password
    const status = {
      hasDbUrl: !!dbUrl,
      dbUrlLength: dbUrl.length,
      startsWithQuote: dbUrl.startsWith('"') || dbUrl.startsWith("'"),
      endsWithQuote: dbUrl.endsWith('"') || dbUrl.endsWith("'"),
      startsWithPostgres: dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://'),
      firstChar: dbUrl.length > 0 ? dbUrl[0] : 'EMPTY',
      lastChar: dbUrl.length > 0 ? dbUrl[dbUrl.length - 1] : 'EMPTY',
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
        firstChar: dbUrl.length > 0 ? dbUrl[0] : 'EMPTY',
        lastChar: dbUrl.length > 0 ? dbUrl[dbUrl.length - 1] : 'EMPTY',
      },
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 3)
    }, { status: 500 });
  }
}
