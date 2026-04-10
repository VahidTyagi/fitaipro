import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserButton } from "@clerk/nextjs";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/onboarding");

  const trialEnd = dbUser.trialEnd ? new Date(dbUser.trialEnd) : null;
  const daysLeft = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-gray-400">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-bold mb-4">Profile</h2>
        <div className="flex items-center gap-4">
        // CORRECT
        <UserButton />
          <div>
            <p className="text-white font-medium">{dbUser.name || "User"}</p>
            <p className="text-gray-400 text-sm">{dbUser.email}</p>
          </div>
        </div>
      </div>

      {/* Plan */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-bold mb-4">Current Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium capitalize">{dbUser.plan} Plan</p>
            <p className="text-gray-400 text-sm">
              {daysLeft > 0
                ? `Free trial: ${daysLeft} days remaining`
                : "Trial ended — workouts still free"}
            </p>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 text-sm font-semibold px-4 py-2 rounded-full capitalize">
            {dbUser.plan}
          </span>
        </div>
      </div>

      {/* Fitness Profile */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-bold mb-4">Fitness Profile</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Goal", value: dbUser.goal?.replace("_", " ") || "—" },
            { label: "Level", value: dbUser.fitnessLevel || "—" },
            { label: "Workout Type", value: dbUser.workoutType?.replace(/_/g, " ") || "—" },
            { label: "Dieting", value: dbUser.dietType?.replace("_", " ") || "—" },
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
    </div>
  );
}