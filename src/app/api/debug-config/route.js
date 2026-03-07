import { NextResponse } from "next/server";

// GET /api/debug-config - returns which env vars are set (no values). remove in production.
export async function GET() {
  return NextResponse.json({
    GROQ_API_KEY: !!process.env.GROQ_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}
