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

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let clerkUser: Awaited<ReturnType<typeof currentUser>> = null;
  try {
    clerkUser = await currentUser();
  } catch {
    // Clerk user fetch failed — use fallback
  }

  let dbUser = null;

  try {
    dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  } catch (err) {
    console.error("DB findUnique failed:", err);
    // DB connection issue — show error page
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl font-bold mb-2">Connection Error</p>
          <p className="text-gray-400 text-sm">Database temporarily unavailable. Please refresh.</p>
        </div>
      </div>
    );
  }

  if (!dbUser) {
    // New user — create DB record
    const email = clerkUser?.emailAddresses[0]?.emailAddress || "";
    const name = buildCleanName(
      clerkUser?.fullName,
      clerkUser?.firstName,
      clerkUser?.lastName,
      email
    );

    try {
      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          name,
          imageUrl: clerkUser?.imageUrl || null,
          trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    } catch (createErr) {
      console.error("Failed to create user:", createErr);
      // Try upsert as fallback
      try {
        dbUser = await prisma.user.upsert({
          where: { clerkId: userId },
          update: { name, imageUrl: clerkUser?.imageUrl || null },
          create: {
            clerkId: userId,
            email,
            name,
            imageUrl: clerkUser?.imageUrl || null,
            trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      } catch (upsertErr) {
        console.error("Upsert also failed:", upsertErr);
        return (
          <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="text-center px-4">
              <p className="text-white text-xl font-bold mb-2">Setup Error</p>
              <p className="text-gray-400 text-sm mb-4">
                Could not create your profile. Please try signing out and back in.
              </p>
              <a>
                href="/sign-in"
                className="bg-emerald-500 text-white px-6 py-2 rounded-xl text-sm font-semibold"
              
                Go to Sign In
              </a>
            </div>
          </div>
        );
      }
    }
  }

  // Fix broken name silently
  if (
    dbUser &&
    (!dbUser.name || dbUser.name.includes("+") || dbUser.name.includes("@"))
  ) {
    const email =
      clerkUser?.emailAddresses[0]?.emailAddress || dbUser.email;
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
      // Non-blocking — name fix failed, continue
    }
  }

  // Redirect to onboarding if not done
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