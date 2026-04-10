import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Dumbbell, Apple, TrendingUp,
  Flame, Zap, Trophy, ChevronRight,
} from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      workouts: { orderBy: { createdAt: "desc" }, take: 3 },
      progress: { orderBy: { loggedAt: "desc" }, take: 1 },
    },
  });

  if (!dbUser) redirect("/onboarding");
  if (!dbUser.onboardingDone) redirect("/onboarding");

  const trialEnd = dbUser.trialEnd ? new Date(dbUser.trialEnd) : null;
  const daysLeft = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const trialActive = daysLeft > 0;

  const workoutTypeLabel: Record<string, string> = {
    home_no_equipment: "Home (No Equipment)",
    home_with_equipment: "Home + Equipment",
    gym: "Gym Workout",
  };

  const goalLabel: Record<string, string> = {
    lose_weight: "Lose Weight 🔥",
    build_muscle: "Build Muscle 💪",
    stay_fit: "Stay Fit ⚡",
    improve_endurance: "Improve Endurance 🏃",
  };

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Trial / Upgrade Banner */}
      {trialActive ? (
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-emerald-400 font-semibold text-lg">
              🎁 Free Trial Active — {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Full access to diet plans. Workouts are always free forever.
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
              Workouts are still free! Upgrade to unlock diet plans.
            </p>
          </div>
          <Link
            href="/pricing"
            className="bg-amber-500 text-black font-semibold px-5 py-2 rounded-full text-sm hover:bg-amber-400 transition-colors whitespace-nowrap"
          >
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Workouts Done",
            value: dbUser.workouts?.length || 0,
            icon: Dumbbell,
            color: "from-emerald-500 to-teal-500",
          },
          {
            label: "Day Streak",
            value: "0",
            icon: Flame,
            color: "from-orange-500 to-amber-500",
          },
          {
            label: "Calories Burned",
            value: "0",
            icon: Zap,
            color: "from-blue-500 to-cyan-500",
          },
          {
            label: "Achievements",
            value: "0",
            icon: Trophy,
            color: "from-purple-500 to-pink-500",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-gray-500 text-sm mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* My Plan Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-bold text-lg mb-4">My Plan</h2>
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
      <div className="grid md:grid-cols-3 gap-5">
        {[
          {
            title: "Today's Workout",
            desc: "Start your AI-generated workout",
            emoji: "💪",
            gradient: "from-emerald-500 to-teal-500",
            href: "/dashboard/workout",
            badge: "Always Free",
            badgeColor: "bg-emerald-500/20 text-emerald-400",
          },
          {
            title: "Nutrition Plan",
            desc: trialActive
              ? `${daysLeft} days left of free diet plan`
              : "Upgrade to unlock",
            emoji: "🥗",
            gradient: "from-orange-500 to-amber-500",
            href: "/dashboard/nutrition",
            badge: trialActive ? `${daysLeft} days free` : "Upgrade",
            badgeColor: trialActive
              ? "bg-orange-500/20 text-orange-400"
              : "bg-amber-500/20 text-amber-400",
          },
          {
            title: "Track Progress",
            desc: "Log weight, body fat & notes",
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
            className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all"
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <span className="text-xl">{card.emoji}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold">{card.title}</h3>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors" />
            </div>
            <p className="text-gray-500 text-sm mb-3">{card.desc}</p>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${card.badgeColor}`}>
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
              { label: "Current Weight", value: dbUser.currentWeight ? `${dbUser.currentWeight} kg` : "—" },
              { label: "Target Weight", value: dbUser.targetWeight ? `${dbUser.targetWeight} kg` : "—" },
              { label: "Height", value: dbUser.height ? `${dbUser.height} cm` : "—" },
              { label: "Age", value: dbUser.age ? `${dbUser.age} years` : "—" },
            ].map((item) => (
              <div key={item.label} className="bg-gray-800/50 rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-1">{item.label}</p>
                <p className="text-white font-bold text-lg">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}