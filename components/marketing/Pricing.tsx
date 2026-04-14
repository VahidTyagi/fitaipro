import Link from "next/link";
import { Check, Zap, Flame } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Get started with basic AI fitness tools",
    features: [
      "All workout types — forever free",
      "AI workout generation",
      "Exercise demos",
      "AI Coach chat (10/day)",
      "7-day free diet plan",
      "Progress tracking",
    ],
    cta: "Start Free",
    href: "/sign-up",
    highlighted: false,
  },
  {
    name: "Pro",
    originalPrice: "₹499",
    price: "₹125",
    period: "per month",
    description: "Everything for serious fitness goals",
    earlyBird: true,
    features: [
      "Everything in Free",
      "30-day AI diet plan",
      "Unlimited AI coach chat",
      "Advanced nutrition tracking",
      "Progress analytics",
      "Priority AI responses",
    ],
    cta: "Get Pro — 75% OFF",
    href: "/pricing",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Elite",
    originalPrice: "₹1,499",
    price: "₹375",
    period: "per month",
    description: "Maximum results guaranteed",
    earlyBird: true,
    features: [
      "Everything in Pro",
      "1-on-1 AI sessions",
      "Custom meal prep guide",
      "WhatsApp support",
      "Quarterly review",
      "Early feature access",
    ],
    cta: "Get Elite — 75% OFF",
    href: "/pricing",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
            Simple Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
            Free to Start. Forever.
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Workouts are always free. 7-day diet trial included.
          </p>
        </div>

        {/* Early bird banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center mb-12 flex items-center justify-center gap-3">
          <Flame className="w-5 h-5 text-amber-500" />
          <p className="text-amber-800 font-semibold text-sm">
            🔥 Early Bird: First 1000 users get <strong>75% OFF</strong> forever — ₹499 → ₹125/month
          </p>
          <Flame className="w-5 h-5 text-amber-500" />
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.highlighted
                  ? "bg-gradient-to-b from-emerald-600 to-teal-700 text-white shadow-2xl shadow-emerald-500/30 scale-105"
                  : "bg-white border border-gray-200 shadow-sm"
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
                <h3 className={`text-lg font-bold mb-2 ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-1">
                  {(plan as any).originalPrice && (
                    <span className={`text-sm line-through ${plan.highlighted ? "text-emerald-200" : "text-gray-400"}`}>
                      {(plan as any).originalPrice}
                    </span>
                  )}
                  <span className={`text-4xl font-extrabold ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                    {plan.price}
                  </span>
                  <span className={plan.highlighted ? "text-emerald-200 text-sm" : "text-gray-500 text-sm"}>
                    /{plan.period}
                  </span>
                </div>
                {(plan as any).earlyBird && (
                  <span className="text-xs bg-amber-400/20 text-amber-600 font-bold px-2 py-0.5 rounded-full">
                    🔥 Early Bird Price
                  </span>
                )}
                <p className={`text-sm mt-2 ${plan.highlighted ? "text-emerald-100" : "text-gray-500"}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlighted ? "text-emerald-200" : "text-emerald-500"}`} />
                    <span className={`text-sm ${plan.highlighted ? "text-emerald-50" : "text-gray-600"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href}>
                <button className={`w-full font-bold py-3 rounded-xl text-sm transition-all ${
                  plan.highlighted
                    ? "bg-white text-emerald-700 hover:bg-gray-50"
                    : "bg-emerald-500 text-white hover:bg-emerald-600"
                }`}>
                  {plan.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}