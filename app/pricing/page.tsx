import Link from "next/link";
import { Check, Zap, ArrowLeft, Shield, Clock, Flame } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getSubscriptionStatus } from "@/lib/subscription";
import { EARLY_BIRD_ACTIVE, EARLY_BIRD_SLOTS_LEFT } from "@/lib/razorpay";
import PaymentButton from "@/components/dashboard/PaymentButton";

export default async function PricingPage() {
  const { userId } = await auth();
  let dbUser = null;
  let status = null;
  if (userId) {
    dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (dbUser) status = getSubscriptionStatus(dbUser);
  }
  const currentPlan = dbUser?.plan || "free";

  const plans = [
    {
      id: "free",
      name: "Free",
      monthlyPrice: "₹0",
      yearlyPrice: "₹0",
      priceNote: "forever",
      description: "Start your fitness journey",
      color: "border-gray-800",
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
      id: "pro",
      name: "Pro",
      monthlyOriginal: "₹499",
      monthlyDiscounted: "₹125",
      yearlyOriginal: "₹5,000",
      yearlyDiscounted: "₹1,250",
      yearlySaving: "Save ₹250",
      description: "For serious fitness goals",
      color: "border-emerald-500",
      highlighted: true,
      badge: "Most Popular",
      planKeyMonthly: "pro_monthly",
      planKeyYearly: "pro_yearly",
      features: [
        { text: "Everything in Free — forever", included: true },
        { text: "Unlimited AI diet plans", included: true },
        { text: "Advanced nutrition tracking", included: true },
        { text: "Detailed progress analytics", included: true },
        { text: "Priority AI responses", included: true },
        { text: "Workout history export", included: true },
        { text: "Custom workout builder", included: true },
        { text: "1-on-1 AI sessions", included: false },
      ],
    },
    {
      id: "elite",
      name: "Elite",
      monthlyOriginal: "₹1,499",
      monthlyDiscounted: "₹375",
      yearlyOriginal: "₹14,999",
      yearlyDiscounted: "₹3,750",
      yearlySaving: "Save ₹750",
      description: "Maximum results guaranteed",
      color: "border-purple-500",
      planKeyMonthly: "elite_monthly",
      planKeyYearly: "elite_yearly",
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

        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">Simple Pricing</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-3 mb-4">Free to Start. Forever.</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">Workouts are always free. 7-day diet trial included. Upgrade only when you need more.</p>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
            {[
              { icon: Shield, text: "No credit card for free" },
              { icon: Clock, text: "Cancel anytime" },
              { icon: Zap, text: "Instant access" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-gray-400 text-sm">
                <Icon className="w-4 h-4 text-emerald-400" />{text}
              </div>
            ))}
          </div>
        </div>

        {/* Early Bird Banner */}
        {EARLY_BIRD_ACTIVE && (
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-5 mb-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 font-bold text-lg">🔥 Early Bird Offer — 75% OFF</span>
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-gray-300 text-sm">
              First <strong className="text-amber-400">{EARLY_BIRD_SLOTS_LEFT} users</strong> get 75% discount forever. Price increases to full price after that.
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="w-48 bg-gray-800 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: "3%" }} />
              </div>
              <span className="text-amber-400 text-xs font-bold">~30 claimed so far</span>
            </div>
          </div>
        )}

        {/* Current Plan Banner */}
        {dbUser && status?.isPaid && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center mb-10">
            <p className="text-emerald-400 font-semibold">
              ✅ You&apos;re on the <span className="capitalize">{currentPlan}</span> plan
              {dbUser.subscriptionEnd && ` — expires ${new Date(dbUser.subscriptionEnd).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`}
            </p>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-gray-900 border-2 rounded-2xl p-8 flex flex-col ${plan.color} ${(plan as any).highlighted ? "shadow-2xl shadow-emerald-500/20" : ""}`}
            >
              {(plan as any).badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {(plan as any).badge}
                  </span>
                </div>
              )}

              {currentPlan === plan.id && status?.isPaid && (
                <div className="absolute -top-4 right-6">
                  <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">✅ Active</span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-white font-bold text-xl mb-3">{plan.name}</h3>

                {plan.id === "free" ? (
                  <div>
                    <span className="text-4xl font-extrabold text-white">₹0</span>
                    <span className="text-gray-500 text-sm"> / forever</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Monthly pricing */}
                    <div className="bg-gray-800/60 rounded-xl p-3">
                      <p className="text-gray-500 text-xs mb-1">MONTHLY</p>
                      <div className="flex items-baseline gap-2">
                        {EARLY_BIRD_ACTIVE && (
                          <span className="text-gray-600 line-through text-sm">{(plan as any).monthlyOriginal}</span>
                        )}
                        <span className="text-2xl font-extrabold text-white">
                          {EARLY_BIRD_ACTIVE ? (plan as any).monthlyDiscounted : (plan as any).monthlyOriginal}
                        </span>
                        <span className="text-gray-500 text-xs">/month</span>
                      </div>
                    </div>
                    {/* Yearly pricing */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-emerald-400 text-xs font-semibold">YEARLY</p>
                        <span className="text-emerald-400 text-xs font-bold">{(plan as any).yearlySaving}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        {EARLY_BIRD_ACTIVE && (
                          <span className="text-gray-600 line-through text-sm">{(plan as any).yearlyOriginal}</span>
                        )}
                        <span className="text-2xl font-extrabold text-emerald-400">
                          {EARLY_BIRD_ACTIVE ? (plan as any).yearlyDiscounted : (plan as any).yearlyOriginal}
                        </span>
                        <span className="text-gray-500 text-xs">/year</span>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-gray-400 text-sm mt-3">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-2">
                    <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${feature.included ? "text-emerald-500" : "text-gray-700"}`} />
                    <span className={`text-sm ${feature.included ? "text-gray-300" : "text-gray-600 line-through"}`}>{feature.text}</span>
                  </li>
                ))}
              </ul>

              {/* CTAs */}
              {plan.id === "free" ? (
                currentPlan === "free" && !status?.isPaid ? (
                  <div className="w-full text-center bg-gray-800 text-gray-400 font-semibold py-3 rounded-xl text-sm">✅ Your Current Plan</div>
                ) : (
                  <Link href="/dashboard" className="w-full text-center bg-gray-800 text-gray-300 font-semibold py-3 rounded-xl text-sm hover:bg-gray-700 block">
                    Go to Dashboard
                  </Link>
                )
              ) : currentPlan === plan.id && status?.isPaid ? (
                <div className="w-full text-center bg-emerald-500/20 text-emerald-400 font-semibold py-3 rounded-xl text-sm border border-emerald-500/30">
                  ✅ Active Plan
                </div>
              ) : userId ? (
                <div className="space-y-2">
                  <PaymentButton
                    planKey={(plan as any).planKeyMonthly}
                    label={`Get Monthly — ${EARLY_BIRD_ACTIVE ? (plan as any).monthlyDiscounted : (plan as any).monthlyOriginal}/mo`}
                  />
                  <PaymentButton
                    planKey={(plan as any).planKeyYearly}
                    label={`Get Yearly — ${EARLY_BIRD_ACTIVE ? (plan as any).yearlyDiscounted : (plan as any).yearlyOriginal}/yr 🔥`}
                    className="w-full bg-gray-800 border border-emerald-500/40 text-emerald-400 font-bold py-3 rounded-xl hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-2 text-sm"
                  />
                </div>
              ) : (
                <Link href="/sign-up" className="w-full text-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 rounded-xl text-sm hover:from-emerald-600 hover:to-teal-600 transition-all block">
                  Get Started Free
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-12 text-center">
          <h2 className="text-white font-bold text-xl mb-4">All Indian Payment Methods</h2>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            {["UPI (GPay, PhonePe, Paytm)", "Credit Card", "Debit Card", "Net Banking", "EMI", "Wallets"].map((m) => (
              <span key={m} className="bg-gray-800 px-4 py-2 rounded-full">{m}</span>
            ))}
          </div>
          <p className="text-gray-500 text-xs mt-4">Powered by Razorpay • 100% secure • PCI DSS compliant</p>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Common Questions</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { q: "Are workouts really free forever?", a: "Yes! All 3 workout types with AI generation and GIF demos are permanently free. No credit card needed, no expiry." },
              { q: "How long does the 75% discount last?", a: "This early bird discount is locked in forever for the first 1000 users. Your price never increases as long as you stay subscribed." },
              { q: "What's the difference between monthly and yearly?", a: "Yearly gives you 2 months free (you pay for 10 months, get 12). Same features, better value." },
              { q: "Can I cancel my subscription?", a: "Yes, cancel anytime by emailing support@fitaipro.com. You keep access until the end of your billing period." },
              { q: "What happens after 7-day diet trial?", a: "Workouts stay free forever. Only diet plans require Pro. No auto-charge — you choose when to upgrade." },
              { q: "Is my payment secure?", a: "100% secure via Razorpay — the same gateway used by Zomato, Swiggy, and 8 million+ Indian businesses." },
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