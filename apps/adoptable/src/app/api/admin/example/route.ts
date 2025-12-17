import { requireAdmin } from "@/lib/auth-guards";
import { NextResponse } from "next/server";

// Example protected admin API route
export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  // Admin-only logic here
  return NextResponse.json({ 
    message: "This is a protected admin endpoint",
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  // Admin-only POST logic here
  const body = await request.json();
  
  return NextResponse.json({ 
    message: "Admin action completed",
    data: body
  });
}
