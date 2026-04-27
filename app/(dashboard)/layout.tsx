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

  let clerkUser = null;
  try {
    clerkUser = await currentUser();
  } catch {
    // Non-blocking
  }

  let dbUser = null;

  try {
    dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  } catch (err) {
    console.error("DB findUnique error:", err);
    // DB unavailable — show maintenance page
    return (
      <html>
        <body>
          <div
            style={{
              minHeight: "100vh",
              background: "#030712",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "sans-serif",
            }}
          >
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
              <h1 style={{ color: "white", marginBottom: "8px" }}>
                Connection Error
              </h1>
              <p style={{ color: "#9ca3af", marginBottom: "24px" }}>
                Database temporarily unavailable. Please try again.
              </p>
              <a
                href="/dashboard"
                style={{
                  background: "#10b981",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Retry
              </a>
            </div>
          </div>
        </body>
      </html>
    );
  }

  if (!dbUser) {
    const email = clerkUser?.emailAddresses[0]?.emailAddress || "";
    const name = buildCleanName(
      clerkUser?.fullName,
      clerkUser?.firstName,
      clerkUser?.lastName,
      email
    );

    try {
      // Use raw SQL to avoid Prisma schema mismatch issues
      dbUser = await prisma.user.upsert({
        where: { clerkId: userId },
        update: {
          imageUrl: clerkUser?.imageUrl ?? null,
        },
        create: {
          clerkId: userId,
          email,
          name,
          imageUrl: clerkUser?.imageUrl ?? null,
          trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    } catch (err) {
      console.error("User create failed:", err);
      // Last resort — try minimal create
      try {
        dbUser = await prisma.$queryRaw`
          INSERT INTO "User" ("id", "clerkId", "email", "name", "createdAt", "updatedAt", "trialEnd")
          VALUES (
            gen_random_uuid()::text,
            ${userId},
            ${clerkUser?.emailAddresses[0]?.emailAddress ?? ""},
            ${name},
            NOW(),
            NOW(),
            NOW() + INTERVAL '7 days'
          )
          ON CONFLICT ("clerkId") DO UPDATE SET "updatedAt" = NOW()
          RETURNING *
        ` as any;
        if (Array.isArray(dbUser)) dbUser = dbUser[0];
      } catch (sqlErr) {
        console.error("Raw SQL also failed:", sqlErr);
        redirect("/sign-in");
      }
    }
  }

  // Fix broken name
  if (
    dbUser?.name &&
    (dbUser.name.includes("+") || dbUser.name.includes("@"))
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
      // Non-blocking
    }
  }

  if (!dbUser?.onboardingDone) redirect("/onboarding");

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