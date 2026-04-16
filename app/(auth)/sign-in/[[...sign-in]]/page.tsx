import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome Back 💪</h1>
          <p className="text-gray-400 text-sm">Sign in to continue your fitness journey</p>
        </div>
        <div className="w-full overflow-hidden">
          <SignIn />
        </div>
      </div>
    </div>
  );
}