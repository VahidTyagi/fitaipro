import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚀</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Start Your Journey 🚀</h1>
        <p className="text-gray-400 text-sm">Free forever. No credit card required.</p>
      </div>
      <SignUp
        routing="hash"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/onboarding"
      />
    </div>
  );
}