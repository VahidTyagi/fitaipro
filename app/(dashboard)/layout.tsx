import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSubscriptionStatus } from "@/lib/subscription";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

function buildCleanName(
  fullName?: string | null,
  firstName?: string | null,
  lastName?: string | null,
  email?: string
): string {
  if (fullName && !fullName.includes("@") && !fullName.includes("+")) {
    return fullName.trim();
  }
  const parts = [firstName, lastName].filter(
    (p) => p && p.trim() && !p.includes("+") && !p.includes("@")
  );
  if (parts.length > 0) return parts.join(" ").trim();
  if (email) {
    const local = email.split("@")[0].split("+")[0];
    return local
      .replace(/[._-]/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return "User";
}

function ErrorPage({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="text-white text-xl font-bold mb-2">Something went wrong</h1>
        <p className="text-gray-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
        <a>
            href="/dashboard"
            className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors"
         
            Try Again
          </a>
          <a>
            href="/sign-out"
            className="bg-gray-800 border border-gray-700 text-gray-300 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors"
          
            Sign Out
          </a>
        </div>
      </div>
    </div>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Step 1: Get Clerk user ID
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Step 2: Get Clerk user details (non-blocking)
  let clerkUser = null;
  try {
    clerkUser = await currentUser();
  } catch (err) {
    console.error("Clerk currentUser failed:", err);
  }

  // Step 3: Find or create DB user
  let dbUser = null;

  try {
    dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
  } catch (err) {
    console.error("DB findUnique error:", err);
    return (
      <ErrorPage message="Database temporarily unavailable. Please try again in a moment." />
    );
  }

  // New user — create their DB record
  if (!dbUser) {
    const email = clerkUser?.emailAddresses[0]?.emailAddress || "";
    const name = buildCleanName(
      clerkUser?.fullName,
      clerkUser?.firstName,
      clerkUser?.lastName,
      email
    );

    try {
      dbUser = await prisma.user.upsert({
        where: { clerkId: userId },
        update: {
          name: name || undefined,
          imageUrl: clerkUser?.imageUrl || undefined,
        },
        create: {
          clerkId: userId,
          email,
          name,
          imageUrl: clerkUser?.imageUrl || null,
          trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    } catch (err) {
      console.error("User create/upsert failed:", err);
      return (
        <ErrorPage message="Could not create your profile. Please sign out and sign in again." />
      );
    }
  }

  // Fix broken name silently (email used as name)
  if (
    dbUser &&
    dbUser.name &&
    (dbUser.name.includes("+") || dbUser.name.includes("@"))
  ) {
    const email = clerkUser?.emailAddresses[0]?.emailAddress || dbUser.email;
    const name = buildCleanName(
      clerkUser?.fullName,
      clerkUser?.firstName,
      clerkUser?.lastName,
      email
    );
    try {
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { name },
      });
    } catch {
      // Non-blocking
    }
  }

  // Redirect to onboarding if not completed
  if (!dbUser?.onboardingDone) {
    redirect("/onboarding");
  }

  const status = getSubscriptionStatus(dbUser);

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Sidebar user={dbUser} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          user={dbUser}
          trialActive={status.isTrialActive}
          daysLeft={status.daysLeft}
          isPaid={status.isPaid}
          plan={status.plan}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}