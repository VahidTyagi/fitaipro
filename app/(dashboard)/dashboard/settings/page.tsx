import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Crown, Clock, CreditCard, ChevronRight } from "lucide-react";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      payments: {
        orderBy: { createdAt: "desc" },
        take: 5,
        where: { status: "paid" },
      },
    },
  });

  if (!dbUser) redirect("/onboarding");

  const trialEnd = dbUser.trialEnd ? new Date(dbUser.trialEnd) : null;
  const daysLeft = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const trialActive = daysLeft > 0;
  const isPro = dbUser.plan === "pro" || dbUser.plan === "elite";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-gray-400">Manage your account and subscription</p>
      </div>

      {/* Profile Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-bold mb-4">Profile</h2>
        <div className="flex items-center gap-4">
          <UserButton />
          <div>
            <p className="text-white font-medium">{dbUser.name || "User"}</p>
            <p className="text-gray-400 text-sm">{dbUser.email}</p>
          </div>
        </div>
      </div>

      {/* Subscription Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-bold mb-5 flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-400" />
          Subscription
        </h2>

        {isPro ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold capitalize">{dbUser.plan} Plan</p>
                <p className="text-gray-400 text-sm">
                  {dbUser.subscriptionEnd
                    ? `Renews on ${new Date(dbUser.subscriptionEnd).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`
                    : "Active subscription"}
                </p>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 text-sm font-bold px-4 py-2 rounded-full capitalize">
                {dbUser.plan}
              </span>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-gray-400 text-sm">
                To cancel your subscription, email us at{" "}
                <a href="mailto:vahidtyagi007@gmail.com" className="text-emerald-400 hover:underline">
                vahidtyagi007@gmail.com
                </a>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">Free Plan</p>
                <p className="text-gray-400 text-sm">
                  {trialActive
                    ? `Diet trial: ${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining`
                    : "Diet trial ended — workouts still free"}
                </p>
              </div>
              <span className="bg-gray-800 text-gray-400 text-sm font-bold px-4 py-2 rounded-full">
                Free
              </span>
            </div>
            <Link
              href="/pricing"
              className="flex items-center justify-between bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-4 hover:from-emerald-500/20 hover:to-teal-500/20 transition-all"
            >
              <div>
                <p className="text-emerald-400 font-semibold text-sm">Upgrade to Pro — ₹499/month</p>
                <p className="text-gray-400 text-xs mt-0.5">Unlimited diet plans + advanced features</p>
              </div>
              <ChevronRight className="w-5 h-5 text-emerald-400" />
            </Link>
          </div>
        )}
      </div>

      {/* Payment History */}
      {dbUser.payments && dbUser.payments.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-400" />
            Payment History
          </h2>
          <div className="space-y-3">
            {dbUser.payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between bg-gray-800/50 rounded-xl p-4">
                <div>
                  <p className="text-white font-medium capitalize">{payment.plan} Plan</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">₹{(payment.amount / 100).toLocaleString()}</p>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                    Paid
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fitness Profile */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-bold mb-4">Fitness Profile</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Goal", value: dbUser.goal?.replace(/_/g, " ") || "—" },
            { label: "Level", value: dbUser.fitnessLevel || "—" },
            { label: "Workout Type", value: dbUser.workoutType?.replace(/_/g, " ") || "—" },
            { label: "Diet", value: dbUser.dietType?.replace(/_/g, " ") || "—" },
            { label: "Height", value: dbUser.height ? `${dbUser.height} cm` : "—" },
            { label: "Weight", value: dbUser.currentWeight ? `${dbUser.currentWeight} kg` : "—" },
          ].map((item) => (
            <div key={item.label} className="bg-gray-800/50 rounded-xl p-3">
              <p className="text-gray-500 text-xs capitalize">{item.label}</p>
              <p className="text-white font-medium text-sm capitalize mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-gray-900 border border-red-900/30 rounded-2xl p-6">
        <h2 className="text-red-400 font-bold mb-2">Support</h2>
        <p className="text-gray-400 text-sm mb-4">
          Need help? Having issues? Contact us and we&apos;ll respond within 24 hours.
        </p>
        <a
          href="mailto:vahidtyagi007@gmail.com"
          className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors"
        >
          vahidtyagi007@gmail.com →
        </a>
      </div>
    </div>
  );
}