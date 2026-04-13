export interface SubscriptionStatus {
    isPaid: boolean;
    isTrialActive: boolean;
    daysLeft: number;
    plan: string;
    label: string;
    subscriptionEnd: Date | null;
  }
  
  export function getSubscriptionStatus(dbUser: {
    plan: string;
    trialEnd?: Date | null;
    subscriptionEnd?: Date | null;
    subscriptionStatus?: string | null;
  }): SubscriptionStatus {
    const now = new Date();
  
    const isPaid =
      (dbUser.plan === "pro" || dbUser.plan === "elite") &&
      dbUser.subscriptionStatus === "active" &&
      dbUser.subscriptionEnd !== null &&
      dbUser.subscriptionEnd !== undefined &&
      new Date(dbUser.subscriptionEnd) > now;
  
    if (isPaid) {
      const subEnd = new Date(dbUser.subscriptionEnd!);
      const daysLeft = Math.max(
        0,
        Math.ceil((subEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );
      return {
        isPaid: true,
        isTrialActive: true, // paid = always has access
        daysLeft,
        plan: dbUser.plan,
        label: `${dbUser.plan.charAt(0).toUpperCase() + dbUser.plan.slice(1)} Plan`,
        subscriptionEnd: subEnd,
      };
    }
  
    // Check free trial
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
      label: isTrialActive ? `Free Trial (${trialDaysLeft} days left)` : "Free Plan",
      subscriptionEnd: null,
    };
  }