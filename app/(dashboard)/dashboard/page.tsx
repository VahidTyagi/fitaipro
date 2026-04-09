import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Zap } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();

  // Get user from our DB
  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  // If not in DB yet (webhook delay), create them
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

  // If onboarding not done → redirect
  if (!dbUser.onboardingDone) {
    redirect("/onboarding");
  }

  // Calculate trial days left
  const trialEnd = dbUser.trialEnd ? new Date(dbUser.trialEnd) : null;
  const now = new Date();
  const daysLeft = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const trialActive = daysLeft > 0;

  const firstName = dbUser.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top Bar */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl">FitAI<span className="text-emerald-400">Pro</span></span>
        </div>
        <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
          ← Back to Home
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome, {firstName}! 👋
          </h1>
          <p className="text-gray-400">
            Your AI fitness journey starts here.
          </p>
        </div>

        {/* Trial Banner */}
        {trialActive ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-emerald-400 font-semibold">
                🎁 Free Trial Active — {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
              </p>
              <p className="text-gray-400 text-sm mt-1">
                You have full access to diet plans during your trial. Workouts are always free.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-amber-400 font-semibold">⏰ Your free trial has ended</p>
              <p className="text-gray-400 text-sm mt-1">
                Workouts are still free! Upgrade to continue getting diet plans.
              </p>
            </div>
            <Link
              href="/pricing"
              className="bg-amber-500 text-black font-semibold px-5 py-2 rounded-full text-sm hover:bg-amber-400 transition-colors"
            >
              Upgrade Now
            </Link>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Workouts Done", value: "0", emoji: "🏋️" },
            { label: "Calories Burned", value: "0", emoji: "🔥" },
            { label: "Day Streak", value: "0", emoji: "⚡" },
            { label: "Plan", value: dbUser.plan === "free" ? "Free" : "Pro", emoji: "👑" },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <span className="text-2xl">{stat.emoji}</span>
              <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Today's Workout",
              desc: "Your AI-generated workout plan based on your goals",
              emoji: "💪",
              color: "from-emerald-500 to-teal-500",
              href: "/dashboard/workout",
              badge: "Always Free",
            },
            {
              title: "Nutrition Plan",
              desc: trialActive
                ? `${daysLeft} days left of your free diet plan`
                : "Upgrade to unlock diet plans",
              emoji: "🥗",
              color: "from-orange-500 to-amber-500",
              href: "/dashboard/nutrition",
              badge: trialActive ? `${daysLeft} days free` : "Upgrade",
            },
            {
              title: "Progress",
              desc: "Track your weight, strength, and body changes",
              emoji: "📈",
              color: "from-blue-500 to-cyan-500",
              href: "/dashboard/progress",
              badge: "Always Free",
            },
          ].map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <span className="text-xl">{card.emoji}</span>
              </div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-white font-semibold">{card.title}</h3>
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full whitespace-nowrap">
                  {card.badge}
                </span>
              </div>
              <p className="text-gray-500 text-sm">{card.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}