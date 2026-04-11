import Link from "next/link";
import { Check, Zap, ArrowLeft } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "All workout types — forever free",
      "AI workout generation",
      "Exercise GIF demos",
      "7-day free diet plan (trial)",
      "Progress tracking",
      "AI Coach chat",
    ],
    notIncluded: [
      "Diet plans after trial",
      "Advanced analytics",
    ],
    cta: "Get Started Free",
    href: "/sign-up",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "per month",
    description: "For serious fitness goals",
    features: [
      "Everything in Free — forever",
      "Unlimited AI diet plans",
      "Advanced nutrition tracking",
      "Detailed progress analytics",
      "Priority AI responses",
      "Workout history export",
      "Custom workout builder",
    ],
    notIncluded: [],
    cta: "Start Pro — Coming Soon",
    href: "/sign-up",
    highlighted: true,
    badge: "Most Popular",
    comingSoon: true,
  },
  {
    name: "Elite",
    price: "₹1,499",
    period: "per month",
    description: "Maximum results guaranteed",
    features: [
      "Everything in Pro",
      "1-on-1 AI coach sessions",
      "Custom meal prep guide",
      "Body composition analysis",
      "Weekly check-in reports",
      "Early feature access",
    ],
    notIncluded: [],
    cta: "Join Waitlist",
    href: "/sign-up",
    highlighted: false,
    comingSoon: true,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-950 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-10 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="text-center mb-16">
          <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">
            Simple Pricing
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-3 mb-4">
            Free to Start. Always.
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Workouts are free forever. Diet plans free for 7 days. Upgrade anytime to unlock unlimited nutrition AI.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-center">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.highlighted
                  ? "bg-gradient-to-b from-emerald-600 to-teal-700 shadow-2xl shadow-emerald-500/30 scale-105"
                  : "bg-gray-900 border border-gray-800"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-lg font-bold mb-2 ${plan.highlighted ? "text-white" : "text-gray-200"}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-4xl font-extrabold ${plan.highlighted ? "text-white" : "text-white"}`}>
                    {plan.price}
                  </span>
                  <span className={plan.highlighted ? "text-emerald-200 text-sm" : "text-gray-500 text-sm"}>
                    /{plan.period}
                  </span>
                </div>
                <p className={`text-sm ${plan.highlighted ? "text-emerald-100" : "text-gray-500"}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlighted ? "text-emerald-200" : "text-emerald-500"}`} />
                    <span className={`text-sm ${plan.highlighted ? "text-emerald-50" : "text-gray-300"}`}>{f}</span>
                  </li>
                ))}
              </ul>

              {plan.comingSoon ? (
                <div className={`w-full text-center font-semibold py-3 rounded-xl text-sm ${
                  plan.highlighted
                    ? "bg-white/20 text-white border border-white/30"
                    : "bg-gray-800 text-gray-400 border border-gray-700"
                }`}>
                  🚀 Coming Soon
                </div>
              ) : (
                <Link
                  href={plan.href}
                  className={`w-full text-center font-semibold py-3 rounded-xl text-sm transition-all block ${
                    plan.highlighted
                      ? "bg-white text-emerald-700 hover:bg-gray-50"
                      : "bg-emerald-500 text-white hover:bg-emerald-600"
                  }`}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Common Questions</h2>
          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {[
              {
                q: "Are workouts really free forever?",
                a: "Yes! All 3 workout types (home, equipment, gym) with AI generation and GIF demos are permanently free. No credit card, no trial.",
              },
              {
                q: "What happens after my 7-day diet trial?",
                a: "After 7 days, your workout access stays 100% free. Only diet plans require a subscription. No auto-charge.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. No contracts, no commitments. Cancel from settings in one click.",
              },
              {
                q: "When will Pro launch?",
                a: "Pro is coming very soon. Join now to be notified first and get early bird pricing.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-white font-semibold mb-2">{q}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}