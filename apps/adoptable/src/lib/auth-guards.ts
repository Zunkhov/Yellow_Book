import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function requireRole(roles: string[]) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Unauthorized - Authentication required" },
      { status: 401 }
    );
  }

  if (!roles.includes(session.user.role)) {
    return NextResponse.json(
      { error: "Forbidden - Insufficient permissions" },
      { status: 403 }
    );
  }

  return null; // No error, proceed
}

export async function requireAdmin() {
  return requireRole(["admin"]);
}
