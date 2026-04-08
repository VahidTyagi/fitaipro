import Link from "next/link";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Get started with basic AI fitness tools",
    features: [
      "3 AI workouts per month",
      "Basic nutrition logging",
      "Progress tracking",
      "Community access",
    ],
    cta: "Start Free",
    href: "/sign-up",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹999",
    period: "per month",
    description: "Everything you need to transform your fitness",
    features: [
      "Unlimited AI workouts",
      "Advanced nutrition AI",
      "Real-time AI coaching",
      "Progress analytics",
      "Priority support",
      "Wearable sync (coming soon)",
    ],
    cta: "Start Pro Free",
    href: "/sign-up",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Elite",
    price: "₹2,499",
    period: "per month",
    description: "Premium experience with human + AI coaching",
    features: [
      "Everything in Pro",
      "1 human coach check-in/month",
      "Custom meal plans",
      "Body composition analysis",
      "White-glove onboarding",
      "Early feature access",
    ],
    cta: "Go Elite",
    href: "/sign-up",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
            Invest in Your Health
          </h2>
          <p className="text-xl text-gray-500">
            Less than a single gym session. Cancel anytime.
          </p>
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
                  <span className="bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                    <Zap className="w-3 h-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`text-lg font-bold mb-2 ${
                    plan.highlighted ? "text-white" : "text-gray-900"
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span
                    className={`text-4xl font-extrabold ${
                      plan.highlighted ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={
                      plan.highlighted ? "text-emerald-200 text-sm" : "text-gray-500 text-sm"
                    }
                  >
                    /{plan.period}
                  </span>
                </div>
                <p
                  className={`text-sm ${
                    plan.highlighted ? "text-emerald-100" : "text-gray-500"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        plan.highlighted ? "text-emerald-200" : "text-emerald-500"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        plan.highlighted ? "text-emerald-50" : "text-gray-600"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href}>
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "secondary" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}