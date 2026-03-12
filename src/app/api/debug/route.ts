import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL || "";
    
    // Obfuscated visualization of the string structure
    // We show types of characters to see if there are spaces/newlines
    const structure = dbUrl.split('').map((c, i) => {
      if (i < 15 || i > dbUrl.length - 15) return c; // Show start and end
      if (c === ':') return ':';
      if (c === '@') return '@';
      if (c === '/') return '/';
      if (c === '?') return '?';
      if (c === ' ') return '[SPACE]';
      if (c === '\n') return '[NEWLINE]';
      if (c === '\r') return '[CARRIAGE_RETURN]';
      return '*';
    }).join('');

    const status = {
      length: dbUrl.length,
      structure,
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
    const structure = dbUrl.split('').map((c, i) => {
      if (i < 15 || i > dbUrl.length - 15) return c;
      if (' :@/?\n\r'.includes(c)) return c === ' ' ? '[SP]' : c;
      return '*';
    }).join('');

    return NextResponse.json({ 
      ok: false, 
      status: {
        length: dbUrl.length,
        structure,
      },
      error: error.message,
    }, { status: 500 });
  }
}
