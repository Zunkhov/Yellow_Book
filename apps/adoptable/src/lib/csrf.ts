import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

// Generate CSRF token
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Verify CSRF token
export async function verifyCsrfToken(request: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const tokenFromCookie = cookieStore.get("csrf-token")?.value;
  const tokenFromHeader = request.headers.get("x-csrf-token");

  if (!tokenFromCookie || !tokenFromHeader) {
    return false;
  }

  return tokenFromCookie === tokenFromHeader;
}

// Middleware helper for CSRF protection
export async function csrfProtection(request: Request) {
  // Only protect mutation methods
  if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
    const isValid = await verifyCsrfToken(request);
    
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      );
    }
  }

  return null; // No error, proceed
}

// API route to get CSRF token
export async function GET() {
  const token = generateCsrfToken();
  const response = NextResponse.json({ csrfToken: token });
  
  response.cookies.set("csrf-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return response;
}
