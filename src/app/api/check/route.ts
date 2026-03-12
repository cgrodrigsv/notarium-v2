import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || "";
  
  return NextResponse.json({
    len: dbUrl.length,
    // Safely check what's going on
    start: dbUrl.substring(0, 5),
    end: dbUrl.substring(dbUrl.length - 5),
    hasQuotes: dbUrl.includes('"') || dbUrl.includes("'"),
    hasDollar: dbUrl.includes('$'),
    hasEnv: dbUrl.includes('env'),
    // Let's see if the user pasted the command
    isCommand: dbUrl.includes('$env'),
  });
}
