"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AuthButton() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <div className="text-sm text-gray-600">Loading...</div>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">
          {session.user?.name || session.user?.email}
          {session.user?.role === "admin" && (
            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              Admin
            </span>
          )}
        </span>
        {session.user?.role === "admin" && (
          <Link
            href="/admin"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Dashboard
          </Link>
        )}
        <button
          onClick={() => signOut()}
          className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => router.push("/auth/signin")}
      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm hover:shadow-md"
    >
      Sign In
    </button>
  );
}
