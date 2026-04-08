import { Brain, Dumbbell, Apple, TrendingUp, Clock, Shield } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Personalization",
    description:
      "Our AI analyzes your fitness level, goals, and recovery to build a plan that's 100% yours — updated every week.",
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    icon: Dumbbell,
    title: "Smart Workout Generator",
    description:
      "Get gym or home workouts in seconds. Sets, reps, rest times, and exercise substitutions all handled by AI.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Apple,
    title: "Nutrition Intelligence",
    description:
      "Log meals with text. Get macro breakdowns, calorie targets, and meal suggestions based on your workout data.",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Track weight, strength PRs, and consistency streaks. See your transformation with beautiful visual charts.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Clock,
    title: "Real-Time AI Coach",
    description:
      "Ask your AI coach anything — form tips, meal swaps, motivation, recovery advice. Available 24/7.",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    icon: Shield,
    title: "Science-Backed Programs",
    description:
      "Every plan is built on sports science. Progressive overload, periodization, and recovery are built in.",
    gradient: "from-violet-500 to-purple-500",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
            Everything You Need
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
            Your Complete Fitness OS
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            FitAI Pro replaces your personal trainer, nutritionist, and fitness
            app — all in one intelligent platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-8 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 cursor-default"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}