import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚡</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">
          Welcome Back 💪
        </h1>
        <p className="text-gray-400 text-sm">
          Sign in to continue your fitness journey
        </p>
      </div>

      <SignIn
        routing="hash"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
      />

      <p className="text-gray-500 text-sm mt-4 text-center">
        New to FitAI Pro?{" "}
        <Link
          href="/sign-up"
          className="text-emerald-400 hover:text-emerald-300 font-medium"
        >
          Create free account
        </Link>
      </p>
    </div>
  );
}