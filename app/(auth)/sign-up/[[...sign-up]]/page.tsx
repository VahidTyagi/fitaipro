import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Start Your Journey 🚀</h1>
        <p className="text-gray-400">Free forever. No credit card required.</p>
      </div>
      <SignUp forceRedirectUrl="/onboarding" />
    </div>
  );
}