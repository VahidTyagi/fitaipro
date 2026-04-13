import Link from "next/link";
import { Check, Zap, ArrowLeft, Shield, Clock } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import PaymentButton from "@/components/dashboard/PaymentButton";

export default async function PricingPage() {
  const { userId } = await auth();
  let dbUser = null;
  if (userId) {
    dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  }
  const currentPlan = dbUser?.plan || "free";

  const plans = [
    {
      id: "free", name: "Free", price: "₹0", priceNote: "forever",
      description: "Start your fitness journey", color: "border-gray-800",
      features: [
        { text: "All 3 workout types — forever", included: true },
        { text: "AI workout generation", included: true },
        { text: "Exercise GIF demos", included: true },
        { text: "AI Coach chat", included: true },
        { text: "Progress tracking & charts", included: true },
        { text: "7-day free AI diet plan", included: true },
        { text: "Unlimited AI diet plans", included: false },
        { text: "Advanced analytics", included: false },
      ],
    },
    {
      id: "pro", name: "Pro", price: "₹499", priceNote: "per month",
      description: "For serious fitness goals", color: "border-emerald-500",
      highlighted: true, badge: "Most Popular",
      features: [
        { text: "Everything in Free — forever", included: true },
        { text: "Unlimited AI diet plans", included: true },
        { text: "Advanced nutrition tracking", included: true },
        { text: "Detailed progress analytics", included: true },
        { text: "Priority AI responses", included: true },
        { text: "Workout history export", included: true },
        { text: "Custom workout builder", included: true },
        { text: "1-on-1 AI coach sessions", included: false },
      ],
    },
    {
      id: "elite", name: "Elite", price: "₹1,499", priceNote: "per month",
      description: "Maximum results guaranteed", color: "border-purple-500",
      features: [
        { text: "Everything in Pro", included: true },
        { text: "1-on-1 AI coach sessions", included: true },
        { text: "Custom meal prep guide", included: true },
        { text: "Body composition analysis", included: true },
        { text: "Weekly check-in reports", included: true },
        { text: "Early feature access", included: true },
        { text: "WhatsApp coach support", included: true },
        { text: "Quarterly fitness review", included: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <Link href={dbUser ? "/dashboard" : "/"} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-12 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          {dbUser ? "Back to Dashboard" : "Back to Home"}
        </Link>

        <div className="text-center mb-16">
          <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">Simple Pricing</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-3 mb-4">Free to Start. Forever.</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">Workouts are always free. 7-day diet trial included. Upgrade only when you need more.</p>
          <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
            {[{ icon: Shield, text: "No credit card for free" }, { icon: Clock, text: "Cancel anytime" }, { icon: Zap, text: "Instant access" }].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-gray-400 text-sm">
                <Icon className="w-4 h-4 text-emerald-400" />{text}
              </div>
            ))}
          </div>
        </div>

        {dbUser && currentPlan !== "free" && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center mb-10">
            <p className="text-emerald-400 font-semibold">✅ You&apos;re on the <span className="capitalize">{currentPlan}</span> plan{dbUser.subscriptionEnd && ` — renews ${new Date(dbUser.subscriptionEnd).toLocaleDateString("en-IN")}`}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => (
            <div key={plan.id} className={`relative bg-gray-900 border-2 rounded-2xl p-8 flex flex-col ${plan.color} ${(plan as any).highlighted ? "shadow-2xl shadow-emerald-500/20" : ""}`}>
              {(plan as any).badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {(plan as any).badge}
                  </span>
                </div>
              )}
              {currentPlan === plan.id && (
                <div className="absolute -top-4 right-6">
                  <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">Current Plan</span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-white font-bold text-xl mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-gray-500 text-sm">/{plan.priceNote}</span>
                </div>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-2">
                    <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${feature.included ? "text-emerald-500" : "text-gray-700"}`} />
                    <span className={`text-sm ${feature.included ? "text-gray-300" : "text-gray-600 line-through"}`}>{feature.text}</span>
                  </li>
                ))}
              </ul>
              {plan.id === "free" ? (
                currentPlan === "free" ? (
                  <div className="w-full text-center bg-gray-800 text-gray-400 font-semibold py-3 rounded-xl text-sm">✅ Your Current Plan</div>
                ) : (
                  <Link href="/dashboard" className="w-full text-center bg-gray-800 text-gray-300 font-semibold py-3 rounded-xl text-sm hover:bg-gray-700 transition-colors block">Go to Dashboard</Link>
                )
              ) : currentPlan === plan.id ? (
                <div className="w-full text-center bg-emerald-500/20 text-emerald-400 font-semibold py-3 rounded-xl text-sm border border-emerald-500/30">✅ Active Plan</div>
              ) : userId ? (
                <PaymentButton plan={plan.id as "pro" | "elite"} price={plan.price} label={`Upgrade to ${plan.name}`} />
              ) : (
                <Link href="/sign-up" className="w-full text-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 rounded-xl text-sm hover:from-emerald-600 hover:to-teal-600 transition-all block">Get Started Free</Link>
              )}
            </div>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-12 text-center">
          <h2 className="text-white font-bold text-xl mb-4">All Indian Payment Methods Supported</h2>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            {["UPI (GPay, PhonePe, Paytm)", "Credit Card", "Debit Card", "Net Banking", "EMI", "Wallets"].map((m) => (
              <span key={m} className="bg-gray-800 px-4 py-2 rounded-full">{m}</span>
            ))}
          </div>
          <p className="text-gray-500 text-xs mt-4">Powered by Razorpay • 100% secure • PCI DSS compliant</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Common Questions</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { q: "Are workouts really free forever?", a: "Yes! All 3 workout types with AI generation and GIF demos are permanently free. No credit card needed, no expiry." },
              { q: "What payment methods are accepted?", a: "UPI (Google Pay, PhonePe, Paytm), all debit/credit cards, net banking, wallets, and EMI options." },
              { q: "Can I cancel my subscription?", a: "Yes, cancel anytime. You keep access until the end of your billing period. Email support@fitaipro.com" },
              { q: "Is my payment secure?", a: "100% secure via Razorpay, India's most trusted payment gateway used by Zomato, Swiggy, and 8M+ businesses." },
              { q: "What happens after 7-day diet trial?", a: "Workouts stay free forever. Only diet plans require Pro. No auto-charge — you choose when to upgrade." },
              { q: "Do you offer refunds?", a: "Yes, 7-day refund policy. Contact support within 7 days of payment for a full refund." },
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