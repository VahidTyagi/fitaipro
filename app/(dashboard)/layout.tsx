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
  // Try fullName first
  if (fullName && !fullName.includes("@") && !fullName.includes("+")) {
    return fullName.trim();
  }
  // Try first + last
  const parts = [firstName, lastName].filter(
    (p) => p && p.trim() && !p.includes("+") && !p.includes("@")
  );
  if (parts.length > 0) return parts.join(" ").trim();
  // Fall back to email-based name
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

  const clerkUser = await currentUser();

  let dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });

  if (!dbUser) {
    const email =
      clerkUser?.emailAddresses[0]?.emailAddress || "";
    const name = buildCleanName(
      clerkUser?.fullName,
      clerkUser?.firstName,
      clerkUser?.lastName,
      email
    );
    dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        name,
        imageUrl: clerkUser?.imageUrl || null,
        trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  } else if (
    !dbUser.name ||
    dbUser.name.includes("+") ||
    dbUser.name.includes("@")
  ) {
    // Fix broken name in DB
    const email =
      clerkUser?.emailAddresses[0]?.emailAddress || dbUser.email;
    const name = buildCleanName(
      clerkUser?.fullName,
      clerkUser?.firstName,
      clerkUser?.lastName,
      email
    );
    dbUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: { name },
    });
  }

  if (!dbUser.onboardingDone) redirect("/onboarding");

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