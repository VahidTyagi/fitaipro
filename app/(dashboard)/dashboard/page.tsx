import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSubscriptionStatus } from "@/lib/subscription";
import Link from "next/link";
import {
  Dumbbell,
  Flame,
  ChevronRight,
  Clock4,
  Crown,
} from "lucide-react";
import DashboardStats from "@/components/dashboard/DashboardStats";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      workouts: {
        where: { completedAt: { not: null } },
        orderBy: { completedAt: "desc" },
        take: 3,
      },
    },
  });

  if (!dbUser) redirect("/onboarding");
  if (!dbUser.onboardingDone) redirect("/onboarding");

  // ✅ Use unified subscription logic
  const status = getSubscriptionStatus(dbUser);
  const { isPaid, isTrialActive, daysLeft, plan } = status;

  const goalLabel: Record<string, string> = {
    lose_weight: "Lose Weight 🔥",
    build_muscle: "Build Muscle 💪",
    stay_fit: "Stay Fit ⚡",
    improve_endurance: "Improve Endurance 🏃",
  };

  const workoutTypeLabel: Record<string, string> = {
    home_no_equipment: "Home (No Equipment)",
    home_with_equipment: "Home + Equipment",
    gym: "Gym Workout",
  };

  return (
    <div className="space-y-6 max-w-6xl">

      {/* ✅ Smart Banner — shows correct state for free trial, paid, or expired */}
      {isPaid ? (
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-white font-semibold text-lg capitalize">
                {plan} Plan Active 🎉
              </p>
              <p className="text-gray-400 text-sm mt-0.5">
                {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining •{" "}
                {dbUser.subscriptionEnd
                  ? `Renews ${new Date(dbUser.subscriptionEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                  : "Active subscription"}
              </p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="bg-gray-800 border border-gray-700 text-gray-300 font-semibold px-5 py-2 rounded-full text-sm hover:bg-gray-700 transition-colors whitespace-nowrap"
          >
            Manage Plan →
          </Link>
        </div>
      ) : isTrialActive ? (
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-emerald-400 font-semibold text-lg">
              🎁 Free Trial — {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Full access to diet plans during trial. Workouts are always free.
            </p>
          </div>
          <Link
            href="/pricing"
            className="bg-emerald-500 text-white font-semibold px-5 py-2 rounded-full text-sm hover:bg-emerald-600 transition-colors whitespace-nowrap"
          >
            View Plans →
          </Link>
        </div>
      ) : (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-amber-400 font-semibold">⏰ Free trial ended</p>
            <p className="text-gray-400 text-sm mt-1">
              Workouts still free forever! Upgrade for unlimited diet plans.
            </p>
          </div>
          <Link
            href="/pricing"
            className="bg-amber-500 text-black font-semibold px-5 py-2 rounded-full text-sm hover:bg-amber-400 transition-colors whitespace-nowrap"
          >
            Upgrade Now — ₹125/mo 🔥
          </Link>
        </div>
      )}

      {/* Live Stats */}
      <DashboardStats />

      {/* My Fitness Profile */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-bold text-lg mb-4">My Fitness Profile</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Goal", value: goalLabel[dbUser.goal || ""] || "Not set" },
            {
              label: "Level",
              value: dbUser.fitnessLevel
                ? dbUser.fitnessLevel.charAt(0).toUpperCase() + dbUser.fitnessLevel.slice(1)
                : "Not set",
            },
            {
              label: "Workout Type",
              value: workoutTypeLabel[dbUser.workoutType || ""] || "Not set",
            },
            {
              label: "Diet",
              value: dbUser.dietType
                ? dbUser.dietType.replace(/_/g, " ").charAt(0).toUpperCase() +
                  dbUser.dietType.replace(/_/g, " ").slice(1)
                : "Not set",
            },
          ].map((item) => (
            <div key={item.label} className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-gray-500 text-xs mb-1">{item.label}</p>
              <p className="text-white font-medium text-sm">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {[
          {
            title: "Today's Workout",
            desc: "AI-generated workout",
            emoji: "💪",
            gradient: "from-emerald-500 to-teal-500",
            href: "/dashboard/workout",
            badge: "Always Free",
            badgeColor: "bg-emerald-500/20 text-emerald-400",
          },
          {
            title: "Nutrition Plan",
            desc: isPaid
              ? `${plan} — ${daysLeft}d left`
              : isTrialActive
              ? `${daysLeft} days free left`
              : "Upgrade to unlock",
            emoji: "🥗",
            gradient: "from-orange-500 to-amber-500",
            href: "/dashboard/nutrition",
            badge: isPaid ? "✅ Pro" : isTrialActive ? `${daysLeft}d free` : "Upgrade",
            badgeColor: isPaid
              ? "bg-emerald-500/20 text-emerald-400"
              : isTrialActive
              ? "bg-orange-500/20 text-orange-400"
              : "bg-amber-500/20 text-amber-400",
          },
          {
            title: "AI Coach Chat",
            desc: "Ask anything",
            emoji: "🤖",
            gradient: "from-purple-500 to-pink-500",
            href: "/dashboard/chat",
            badge: "Always Free",
            badgeColor: "bg-purple-500/20 text-purple-400",
          },
          {
            title: "Track Progress",
            desc: "Log & view charts",
            emoji: "📈",
            gradient: "from-blue-500 to-cyan-500",
            href: "/dashboard/progress",
            badge: "Always Free",
            badgeColor: "bg-blue-500/20 text-blue-400",
          },
        ].map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all"
          >
            <div
              className={`w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
            >
              <span className="text-base md:text-lg">{card.emoji}</span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-white font-semibold text-xs md:text-sm truncate pr-1">
                {card.title}
              </h3>
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-600 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
            </div>
            <p className="text-gray-500 text-xs mb-3 truncate">{card.desc}</p>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${card.badgeColor}`}>
              {card.badge}
            </span>
          </Link>
        ))}
      </div>

      {/* Body Stats */}
      {(dbUser.currentWeight || dbUser.height || dbUser.age) && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4">Body Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Current Weight",
                value: dbUser.currentWeight ? `${dbUser.currentWeight} kg` : "—",
              },
              {
                label: "Target Weight",
                value: dbUser.targetWeight ? `${dbUser.targetWeight} kg` : "—",
              },
              {
                label: "Height",
                value: dbUser.height ? `${dbUser.height} cm` : "—",
              },
              {
                label: "Age",
                value: dbUser.age ? `${dbUser.age} years` : "—",
              },
            ].map((item) => (
              <div key={item.label} className="bg-gray-800/50 rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-1">{item.label}</p>
                <p className="text-white font-bold text-lg">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Workouts */}
      {dbUser.workouts.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg">Recent Workouts</h2>
            <Link
              href="/dashboard/history"
              className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {dbUser.workouts.map((w) => (
              <div
                key={w.id}
                className="flex items-center gap-4 bg-gray-800/50 rounded-xl p-4"
              >
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{w.title}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(w.completedAt!).toLocaleDateString("en-IN", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 flex-shrink-0">
                  <span className="flex items-center gap-1">
                    <Clock4 className="w-3 h-3" />
                    {w.duration}m
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {w.calories || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}