import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Dumbbell, Apple, TrendingUp,
  Flame, Zap, Trophy, ChevronRight,
  MessageCircle,
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

  const trialEnd = dbUser.trialEnd ? new Date(dbUser.trialEnd) : null;
  const daysLeft = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const trialActive = daysLeft > 0;

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

      {/* Trial / Upgrade Banner */}
      {trialActive ? (
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-emerald-400 font-semibold text-lg">
              🎁 Free Trial — {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Full access to diet plans. Workouts are always free.
            </p>
          </div>
          <Link href="/pricing" className="bg-emerald-500 text-white font-semibold px-5 py-2 rounded-full text-sm hover:bg-emerald-600 transition-colors whitespace-nowrap">
            View Plans →
          </Link>
        </div>
      ) : (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-amber-400 font-semibold">⏰ Free trial ended</p>
            <p className="text-gray-400 text-sm mt-1">Workouts still free! Upgrade for diet plans.</p>
          </div>
          <Link href="/pricing" className="bg-amber-500 text-black font-semibold px-5 py-2 rounded-full text-sm hover:bg-amber-400 transition-colors">
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Live Stats — Client Component */}
      <DashboardStats />

      {/* My Plan */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-bold text-lg mb-4">My Fitness Profile</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Goal", value: goalLabel[dbUser.goal || ""] || "Not set" },
            { label: "Level", value: dbUser.fitnessLevel ? dbUser.fitnessLevel.charAt(0).toUpperCase() + dbUser.fitnessLevel.slice(1) : "Not set" },
            { label: "Workout Type", value: workoutTypeLabel[dbUser.workoutType || ""] || "Not set" },
            { label: "Diet", value: dbUser.dietType ? dbUser.dietType.replace("_", " ").charAt(0).toUpperCase() + dbUser.dietType.slice(1) : "Not set" },
          ].map((item) => (
            <div key={item.label} className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-gray-500 text-xs mb-1">{item.label}</p>
              <p className="text-white font-medium text-sm">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-5">
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
            desc: trialActive ? `${daysLeft} days free` : "Upgrade to unlock",
            emoji: "🥗",
            gradient: "from-orange-500 to-amber-500",
            href: "/dashboard/nutrition",
            badge: trialActive ? `${daysLeft}d free` : "Upgrade",
            badgeColor: trialActive ? "bg-orange-500/20 text-orange-400" : "bg-amber-500/20 text-amber-400",
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
            className="group bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all"
          >
            <div className={`w-11 h-11 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <span className="text-lg">{card.emoji}</span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-white font-semibold text-sm">{card.title}</h3>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors" />
            </div>
            <p className="text-gray-500 text-xs mb-3">{card.desc}</p>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${card.badgeColor}`}>
              {card.badge}
            </span>
          </Link>
        ))}
      </div>

      {/* Recent Workouts */}
      {dbUser.workouts.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg">Recent Workouts</h2>
            <Link href="/dashboard/history" className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {dbUser.workouts.map((w) => (
              <div key={w.id} className="flex items-center gap-4 bg-gray-800/50 rounded-xl p-4">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{w.title}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(w.completedAt!).toLocaleDateString("en-IN", {
                      weekday: "short", month: "short", day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 flex-shrink-0">
                  <span className="flex items-center gap-1">
                    <Clock4 className="w-3 h-3" />{w.duration}m
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3" />{w.calories || 0}
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

// Need to add Clock4 import at top
import { Clock4 } from "lucide-react";