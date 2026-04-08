const steps = [
  {
    step: "01",
    title: "Tell Us About You",
    description:
      "Complete a 2-minute onboarding. Your goals, fitness level, equipment, schedule, and dietary preferences.",
    color: "bg-emerald-500",
  },
  {
    step: "02",
    title: "AI Builds Your Plan",
    description:
      "Our AI generates your personalized weekly workout and nutrition plan in seconds, ready to start immediately.",
    color: "bg-teal-500",
  },
  {
    step: "03",
    title: "Train, Log & Chat",
    description:
      "Follow your AI workouts, log meals, and chat with your AI coach for real-time guidance whenever you need it.",
    color: "bg-cyan-500",
  },
  {
    step: "04",
    title: "Adapt & Progress",
    description:
      "The AI learns from your data and adapts your plan weekly to keep you progressing and never hitting plateaus.",
    color: "bg-blue-500",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
            Simple Process
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
            From Sign-Up to Results in Minutes
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            No complex setup. No confusing interfaces. Just a smart system that
            gets to work immediately.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div
              key={step.step}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div
                className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center mb-5`}
              >
                <span className="text-white font-bold text-sm">{step.step}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}