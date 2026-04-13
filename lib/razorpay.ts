import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const PLANS = {
  pro: {
    name: "Pro",
    amount: 49900,
    currency: "INR",
    description: "FitAI Pro — Unlimited AI Diet Plans",
  },
  elite: {
    name: "Elite",
    amount: 149900,
    currency: "INR",
    description: "FitAI Elite — Premium AI Coaching",
  },
};