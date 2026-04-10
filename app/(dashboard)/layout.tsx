import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email: clerkUser?.emailAddresses[0]?.emailAddress || "",
        name: clerkUser?.fullName || null,
        imageUrl: clerkUser?.imageUrl || null,
        trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  if (!dbUser.onboardingDone) redirect("/onboarding");

  const trialEnd = dbUser.trialEnd ? new Date(dbUser.trialEnd) : null;
  const daysLeft = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const trialActive = daysLeft > 0;

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Sidebar user={dbUser} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          user={dbUser}
          trialActive={trialActive}
          daysLeft={daysLeft}
        />
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}