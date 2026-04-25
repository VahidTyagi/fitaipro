import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "@/components/dashboard/AdminDashboardClient";

const ADMIN_EMAILS = ["vahidtyagi007007@gmail.com", "fitaipro.official@gmail.com"];

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser || !ADMIN_EMAILS.includes(dbUser.email)) {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      workouts: { where: { completedAt: { not: null } }, select: { id: true } },
      payments: { where: { status: "paid" }, select: { id: true, amount: true } },
    },
  });

  const stats = {
    totalUsers: users.length,
    paidUsers: users.filter(u => u.plan === "pro" || u.plan === "elite").length,
    freeTrialUsers: users.filter(u => {
      const trialEnd = u.trialEnd ? new Date(u.trialEnd) : null;
      return u.plan === "free" && trialEnd && trialEnd > new Date();
    }).length,
    totalRevenue: users.reduce((sum, u) =>
      sum + u.payments.reduce((s, p) => s + p.amount, 0), 0),
  };

  return <AdminDashboardClient users={users as any[]} stats={stats} />;
}