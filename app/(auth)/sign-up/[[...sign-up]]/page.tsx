import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Start Your Journey 🚀
          </h1>
          <p className="text-gray-400">
            Free forever. No credit card required.
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-gray-900 border border-gray-800 shadow-2xl rounded-2xl",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton:
                "bg-gray-800 border border-gray-700 text-white hover:bg-gray-700",
              formFieldInput:
                "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500",
              formFieldLabel: "text-gray-300",
              footerActionLink: "text-emerald-400 hover:text-emerald-300",
              formButtonPrimary:
                "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600",
            },
          }}
        />
      </div>
    </div>
  );
}