export interface DbUser {
    id: string;
    clerkId: string;
    email: string;
    name: string | null;
    imageUrl: string | null;
    plan: string;
    trialStart: Date;
    trialEnd: Date | null;
    createdAt: Date;
    updatedAt: Date;
    goal: string | null;
    fitnessLevel: string | null;
    workoutType: string | null;
    dietType: string | null;
    targetWeight: number | null;
    currentWeight: number | null;
    height: number | null;
    age: number | null;
    onboardingDone: boolean;
  }