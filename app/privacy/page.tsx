import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-10 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 md:p-12">
          <h1 className="text-3xl font-extrabold text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-500 text-sm mb-10">Last updated: April 2026</p>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            {[
              {
                title: "1. Information We Collect",
                content: "We collect information you provide during registration (name, email), your fitness profile data (goals, weight, height, fitness level), workout and nutrition logs, progress data, and payment information processed securely through Razorpay. We do not store your card or UPI details — these are handled entirely by Razorpay."
              },
              {
                title: "2. How We Use Your Information",
                content: "We use your data to generate personalized AI workout and nutrition plans, track your fitness progress, provide AI coaching responses, process payments, and improve our services. We never sell your personal data to third parties."
              },
              {
                title: "3. AI Data Processing",
                content: "Your fitness profile and goals are sent to AI providers (Google Gemini / Groq) to generate personalized plans and coaching responses. These providers process data under their own privacy policies. We only send the minimum data necessary."
              },
              {
                title: "4. Data Storage",
                content: "Your data is stored in a secure PostgreSQL database hosted on Neon.tech in the US East region. All data is encrypted in transit using TLS and at rest."
              },
              {
                title: "5. Authentication",
                content: "Authentication is handled by Clerk.com. We do not store passwords. Clerk uses industry-standard security practices including multi-factor authentication support."
              },
              {
                title: "6. Payments",
                content: "All payments are processed by Razorpay, a PCI DSS compliant payment gateway. FitAI Pro never sees or stores your full card number or UPI PIN."
              },
              {
                title: "7. Your Rights",
                content: "You can request deletion of your account and all associated data by emailing support@fitaipro.com. We will process deletion requests within 30 days."
              },
              {
                title: "8. Cookies",
                content: "We use essential cookies for authentication sessions. We do not use advertising or tracking cookies."
              },
              {
                title: "9. Contact",
                content: "For privacy-related queries, contact us at support@fitaipro.com. We will respond within 48 hours."
              },
            ].map((section) => (
              <div key={section.title}>
                <h2 className="text-white font-bold text-lg mb-3">{section.title}</h2>
                <p className="text-gray-400 text-sm leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}