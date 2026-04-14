import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSubscriptionStatus } from "@/lib/subscription";

async function callAI(prompt: string): Promise<string> {
  if (process.env.GROQ_API_KEY) {
    try {
      const Groq = (await import("groq-sdk")).default;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      });
      return completion.choices[0]?.message?.content || "";
    } catch { console.log("Groq failed, trying Gemini..."); }
  }
  if (process.env.GEMINI_API_KEY) {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
  throw new Error("No AI API configured");
}

function getPlanDays(plan: string, isTrialActive: boolean): number {
  if (plan === "pro" || plan === "elite") return 30;
  if (isTrialActive) return 7;
  return 0;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const status = getSubscriptionStatus(dbUser);
    const planDays = getPlanDays(status.plan, status.isTrialActive);

    if (planDays === 0) {
      return NextResponse.json({
        error: "access_denied",
        message: "Your free trial has ended. Upgrade to Pro to generate diet plans.",
        upgradeRequired: true,
      }, { status: 403 });
    }

    // Check if can regenerate today
    const lastGenerated = dbUser.nutritionPlanGeneratedAt
      ? new Date(dbUser.nutritionPlanGeneratedAt)
      : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const canRegenerate = !lastGenerated || lastGenerated < today;

    // If plan already exists and can't regenerate, return cached plan
    if (!canRegenerate && dbUser.nutritionPlanData) {
      return NextResponse.json({
        success: true,
        mealPlan: dbUser.nutritionPlanData,
        cached: true,
        nextRegenerate: "Tomorrow",
      });
    }

    const goal = dbUser.goal || "stay_fit";
    const dietType = dbUser.dietType || "vegetarian";
    const currentWeight = dbUser.currentWeight || 70;
    const targetWeight = dbUser.targetWeight || 65;
    const isWeightLoss = targetWeight < currentWeight;

    // Generate correct number of days
    const daysToGenerate = planDays;
    const prompt = `You are an expert Indian nutritionist. Create a ${daysToGenerate}-day meal plan.
USER: Goal: ${goal.replace(/_/g, " ")}, Diet: ${dietType}, Current: ${currentWeight}kg, Target: ${targetWeight}kg
RULES:
- Use authentic Indian foods (dal, roti, sabzi, paneer, chicken, fish, sprouts, idli etc.)
- Include breakfast, lunch, snack, dinner for EACH of the ${daysToGenerate} days
- Vary meals across days - no repetition for at least 5 days
- Daily calories: ${isWeightLoss ? "1600-1800" : "2200-2500"} kcal
- High protein focus
${dietType === "vegetarian" ? "- STRICTLY NO meat or fish" : ""}
${dietType === "vegan" ? "- STRICTLY NO dairy, meat, or eggs" : ""}
- Include exact quantities (e.g., "2 rotis", "1 bowl", "100g")
Respond ONLY with valid JSON, absolutely no other text:
{
  "targetCalories": 1700,
  "targetProtein": 120,
  "planDays": ${daysToGenerate},
  "days": [
    {
      "day": 1,
      "totalCalories": 1680,
      "totalProtein": 95,
      "meals": [
        {
          "type": "Breakfast",
          "name": "Moong dal chilla with green chutney",
          "calories": 320,
          "protein": 18,
          "carbs": 42,
          "fat": 6,
          "quantity": "2 chillas + 2 tbsp chutney"
        }
      ]
    }
  ]
}`;

    const responseText = await callAI(prompt);
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");
    const mealPlan = JSON.parse(jsonMatch[0]);

    // Save plan to DB so user can reload without regenerating
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        nutritionPlanData: mealPlan as any,
        nutritionPlanGeneratedAt: new Date(),
        nutritionPlanDays: planDays,
      },
    });

    return NextResponse.json({ success: true, mealPlan, cached: false });
  } catch (error) {
    console.error("Nutrition error:", error);
    return NextResponse.json({ error: "Failed to generate meal plan" }, { status: 500 });
  }
}