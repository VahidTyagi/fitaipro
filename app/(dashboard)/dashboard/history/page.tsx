import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Dumbbell, Clock, Flame, CheckCircle, Brain } from "lucide-react";

export default async function HistoryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/onboarding");

  const workouts = await prisma.workout.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const completed = workouts.filter((w) => w.completedAt);
  const totalCalories = completed.reduce((s, w) => s + (w.calories || 0), 0);
  const totalMinutes = completed.reduce((s, w) => s + (w.duration || 0), 0);

  const typeLabel: Record<string, string> = {
    home_no_equipment: "Home",
    home_with_equipment: "Home + Equip",
    gym: "Gym",
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Workout History</h1>
        <p className="text-gray-400">Your complete training log</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Completed", value: completed.length, icon: CheckCircle, color: "text-emerald-400" },
          { label: "Total Time", value: `${Math.round(totalMinutes / 60)}h ${totalMinutes % 60}m`, icon: Clock, color: "text-blue-400" },
          { label: "Calories Burned", value: totalCalories.toLocaleString(), icon: Flame, color: "text-orange-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
            <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
            <p className="text-white font-bold text-xl">{value}</p>
            <p className="text-gray-500 text-sm">{label}</p>
          </div>
        ))}
      </div>

      {/* Workout List */}
      {workouts.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <Dumbbell className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-white font-bold text-lg mb-2">No workouts yet</p>
          <p className="text-gray-500 text-sm">Complete your first workout to see it here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((w) => (
            <div
              key={w.id}
              className={`bg-gray-900 border rounded-2xl p-5 flex items-center gap-4 ${
                w.completedAt ? "border-gray-800" : "border-gray-800 opacity-60"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                w.completedAt ? "bg-emerald-500/20" : "bg-gray-800"
              }`}>
                {w.aiGenerated ? (
                  <Brain className={`w-6 h-6 ${w.completedAt ? "text-emerald-400" : "text-gray-600"}`} />
                ) : (
                  <Dumbbell className={`w-6 h-6 ${w.completedAt ? "text-emerald-400" : "text-gray-600"}`} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-white font-semibold truncate">{w.title}</p>
                  {w.aiGenerated && (
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full flex-shrink-0">
                      AI
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{typeLabel[w.type] || w.type}</span>
                  <span>•</span>
                  <span className="capitalize">{w.level}</span>
                  <span>•</span>
                  <span>
                    {new Date(w.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-center hidden sm:block">
                  <p className="text-white font-bold text-sm">{w.duration}m</p>
                  <p className="text-gray-500 text-xs">Time</p>
                </div>
                <div className="text-center hidden sm:block">
                  <p className="text-white font-bold text-sm">{w.calories || 0}</p>
                  <p className="text-gray-500 text-xs">Cal</p>
                </div>
                {w.completedAt ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-700 rounded-full" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}