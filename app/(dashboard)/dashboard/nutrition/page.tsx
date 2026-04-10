import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Lock } from "lucide-react";

const mealPlan = [
  {
    day: 1,
    meals: [
      { type: "Breakfast", name: "Oats with banana & honey", calories: 380, protein: 12, carbs: 68, fat: 6 },
      { type: "Lunch", name: "Dal rice with mixed vegetables", calories: 520, protein: 18, carbs: 82, fat: 8 },
      { type: "Snack", name: "Apple + handful of almonds", calories: 200, protein: 5, carbs: 28, fat: 10 },
      { type: "Dinner", name: "Paneer sabzi with 2 rotis", calories: 480, protein: 22, carbs: 54, fat: 14 },
    ],
  },
  {
    day: 2,
    meals: [
      { type: "Breakfast", name: "Poha with peas & peanuts", calories: 350, protein: 10, carbs: 58, fat: 8 },
      { type: "Lunch", name: "Chicken curry with brown rice", calories: 580, protein: 35, carbs: 65, fat: 12 },
      { type: "Snack", name: "Greek yogurt with berries", calories: 180, protein: 15, carbs: 22, fat: 3 },
      { type: "Dinner", name: "Grilled fish + salad", calories: 420, protein: 38, carbs: 20, fat: 16 },
    ],
  },
  {
    day: 3,
    meals: [
      { type: "Breakfast", name: "Moong dal chilla + chutney", calories: 320, protein: 14, carbs: 48, fat: 6 },
      { type: "Lunch", name: "Rajma chawal", calories: 550, protein: 22, carbs: 88, fat: 7 },
      { type: "Snack", name: "Sprouts chaat", calories: 160, protein: 10, carbs: 24, fat: 2 },
      { type: "Dinner", name: "Egg bhurji + 2 rotis", calories: 460, protein: 24, carbs: 50, fat: 16 },
    ],
  },
];

const mealTypeColors: Record<string, string> = {
  Breakfast: "bg-amber-500/20 text-amber-400",
  Lunch: "bg-emerald-500/20 text-emerald-400",
  Snack: "bg-blue-500/20 text-blue-400",
  Dinner: "bg-purple-500/20 text-purple-400",
};

export default async function NutritionPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/onboarding");

  const trialEnd = dbUser.trialEnd ? new Date(dbUser.trialEnd) : null;
  const daysLeft = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const trialActive = daysLeft > 0;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Nutrition Plan</h1>
        <p className="text-gray-400">
          {trialActive
            ? `Your personalized 7-day meal plan — ${daysLeft} days remaining`
            : "Your free trial has ended — upgrade to continue"}
        </p>
      </div>

      {/* Trial Banner */}
      {trialActive ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
          <p className="text-emerald-400 font-medium text-sm">
            🎁 Free trial active — {daysLeft} day{daysLeft !== 1 ? "s" : ""} left. After trial, workouts stay free but diet plans require a subscription.
          </p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-amber-500/30 rounded-2xl p-8 text-center">
          <Lock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-white font-bold text-xl mb-2">Diet Plans Locked</h2>
          <p className="text-gray-400 mb-6">
            Your 7-day free trial has ended. Upgrade to continue getting personalized meal plans.
          </p>
          <Link
            href="/pricing"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-8 py-3 rounded-full hover:from-emerald-600 hover:to-teal-600 transition-all inline-block"
          >
            Upgrade Now →
          </Link>
        </div>
      )}

      {/* Meal Plan Days */}
      {trialActive && (
        <div className="space-y-6">
          {mealPlan.map((day) => {
            const totalCal = day.meals.reduce((s, m) => s + m.calories, 0);
            const totalProtein = day.meals.reduce((s, m) => s + m.protein, 0);

            return (
              <div key={day.day} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white font-bold text-lg">Day {day.day}</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">
                      <span className="text-white font-bold">{totalCal}</span> cal
                    </span>
                    <span className="text-gray-400">
                      <span className="text-white font-bold">{totalProtein}g</span> protein
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {day.meals.map((meal) => (
                    <div
                      key={meal.type}
                      className="flex items-center gap-4 bg-gray-800/50 rounded-xl p-4"
                    >
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${mealTypeColors[meal.type]}`}>
                        {meal.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm">{meal.name}</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400 flex-shrink-0">
                        <span className="text-white font-bold">{meal.calories} cal</span>
                        <span className="hidden sm:block">{meal.protein}g P</span>
                        <span className="hidden sm:block">{meal.carbs}g C</span>
                        <span className="hidden sm:block">{meal.fat}g F</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
            <p className="text-gray-400 text-sm">
              Days 4–7 and full AI-personalized plans coming soon. 🚀
            </p>
          </div>
        </div>
      )}
    </div>
  );
}