export interface SubscriptionStatus {
  isPaid: boolean;
  isTrialActive: boolean;
  daysLeft: number;
  plan: string;
  billingCycle: "monthly" | "yearly" | null;
  subscriptionEnd: Date | null;
  label: string;
  nutritionDays: number;
  chatLimit: number;
}

export function getSubscriptionStatus(dbUser: {
  plan: string;
  trialEnd?: Date | null;
  subscriptionEnd?: Date | null;
  subscriptionStatus?: string | null;
  subscriptionPlan?: string | null;
}): SubscriptionStatus {
  const now = new Date();

  // Check if paid plan is active
  const hasPaidPlan = dbUser.plan === "pro" || dbUser.plan === "elite";
  const subEnd = dbUser.subscriptionEnd ? new Date(dbUser.subscriptionEnd) : null;
  const isPaid = hasPaidPlan &&
    dbUser.subscriptionStatus === "active" &&
    subEnd !== null &&
    subEnd > now;

  if (isPaid && subEnd) {
    const daysLeft = Math.max(
      0,
      Math.ceil((subEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );

    // Detect billing cycle based on subscription length
    const subStart = dbUser.subscriptionEnd
      ? new Date(new Date(dbUser.subscriptionEnd).getTime() - 366 * 24 * 60 * 60 * 1000)
      : null;

    // If subscription end is ~365 days from now it was yearly, ~30 days = monthly
    const isYearly = daysLeft > 60;
    const billingCycle = isYearly ? "yearly" : "monthly";

    return {
      isPaid: true,
      isTrialActive: true,
      daysLeft,
      plan: dbUser.plan,
      billingCycle,
      subscriptionEnd: subEnd,
      label: `${dbUser.plan.charAt(0).toUpperCase() + dbUser.plan.slice(1)} Plan`,
      nutritionDays: 30, // Always 30 days per generation for paid
      chatLimit: dbUser.plan === "elite" ? 999999 : 100,
    };
  }

  // Free trial check
  const trialEnd = dbUser.trialEnd ? new Date(dbUser.trialEnd) : null;
  const trialDaysLeft = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const isTrialActive = trialDaysLeft > 0;

  return {
    isPaid: false,
    isTrialActive,
    daysLeft: trialDaysLeft,
    plan: "free",
    billingCycle: null,
    subscriptionEnd: null,
    label: isTrialActive ? `Free Trial (${trialDaysLeft}d left)` : "Free Plan",
    nutritionDays: isTrialActive ? 7 : 0,
    chatLimit: isTrialActive ? 10 : 0,
  };
}