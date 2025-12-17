"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Something went wrong");
      console.error("Sign in error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGitHubSignIn() {
    setLoading(true);
    await signIn("github", { redirectTo: "/" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#FFD700] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-[#333333] text-2xl font-bold">YB</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#333333]">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-[#FFD700] focus:ring-[#FFD700]"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-[#FFD700] hover:text-[#E5C100] font-medium">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#FFD700] hover:bg-[#E5C100] text-[#333333] font-medium rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGitHubSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#333333] hover:bg-[#1a1a1a] border border-[#333333] rounded-lg text-white transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            GitHub
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <a href="#" className="text-[#FFD700] hover:text-[#E5C100] font-medium">
              Sign up
            </a>
          </p>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800 text-center">
              Demo: admin@adoptable.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
