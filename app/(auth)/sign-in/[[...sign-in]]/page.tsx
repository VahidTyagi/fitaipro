import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back 💪</h1>
        <p className="text-gray-400">Sign in to continue your fitness journey</p>
      </div>
      <SignIn forceRedirectUrl="/dashboard" />
    </div>
  );
}