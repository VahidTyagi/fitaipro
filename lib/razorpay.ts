import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Original prices
export const ORIGINAL_PRICES = {
  pro_monthly: 49900,   // ₹499
  pro_yearly: 500000,   // ₹5000
  elite_monthly: 149900, // ₹1499
  elite_yearly: 1499900, // ₹14999
};

// 75% discount for first 1000 users
export const DISCOUNT_PRICES = {
  pro_monthly: 12500,   // ₹125
  pro_yearly: 125000,   // ₹1250
  elite_monthly: 37500, // ₹375
  elite_yearly: 375000, // ₹3750
};

// Toggle this when you hit 1000 users
export const EARLY_BIRD_ACTIVE = true;
export const EARLY_BIRD_SLOTS_LEFT = 1000;

export function getPlanAmount(plan: string, billingCycle: "monthly" | "yearly"): number {
  const key = `${plan}_${billingCycle}` as keyof typeof ORIGINAL_PRICES;
  return EARLY_BIRD_ACTIVE ? DISCOUNT_PRICES[key] : ORIGINAL_PRICES[key];
}

export const PLANS = {
  pro_monthly: {
    name: "Pro",
    billingCycle: "monthly",
    amount: EARLY_BIRD_ACTIVE ? DISCOUNT_PRICES.pro_monthly : ORIGINAL_PRICES.pro_monthly,
    originalAmount: ORIGINAL_PRICES.pro_monthly,
    currency: "INR",
    description: "FitAI Pro Monthly — Unlimited AI Diet Plans",
    plan: "pro",
  },
  pro_yearly: {
    name: "Pro Yearly",
    billingCycle: "yearly",
    amount: EARLY_BIRD_ACTIVE ? DISCOUNT_PRICES.pro_yearly : ORIGINAL_PRICES.pro_yearly,
    originalAmount: ORIGINAL_PRICES.pro_yearly,
    currency: "INR",
    description: "FitAI Pro Yearly — Best Value",
    plan: "pro",
  },
  elite_monthly: {
    name: "Elite",
    billingCycle: "monthly",
    amount: EARLY_BIRD_ACTIVE ? DISCOUNT_PRICES.elite_monthly : ORIGINAL_PRICES.elite_monthly,
    originalAmount: ORIGINAL_PRICES.elite_monthly,
    currency: "INR",
    description: "FitAI Elite Monthly — Premium AI Coaching",
    plan: "elite",
  },
  elite_yearly: {
    name: "Elite Yearly",
    billingCycle: "yearly",
    amount: EARLY_BIRD_ACTIVE ? DISCOUNT_PRICES.elite_yearly : ORIGINAL_PRICES.elite_yearly,
    originalAmount: ORIGINAL_PRICES.elite_yearly,
    currency: "INR",
    description: "FitAI Elite Yearly — Maximum Value",
    plan: "elite",
  },
};