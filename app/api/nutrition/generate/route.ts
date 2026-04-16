import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSubscriptionStatus } from "@/lib/subscription";

async function callAI(prompt: string): Promise<string> {
  const errors: string[] = [];

  // Try Groq first
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
      const text = completion.choices[0]?.message?.content || "";
      if (text) return text;
    } catch (e: any) {
      errors.push(`Groq: ${e.message}`);
    }
  }

  // Try Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) return text;
    } catch (e: any) {
      errors.push(`Gemini: ${e.message}`);
    }
  }

  throw new Error(`All AI providers failed: ${errors.join("; ")}`);
}

// Replace the getPlanDays and prompt section:

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
        message: "Upgrade to Pro to generate diet plans.",
        upgradeRequired: true,
      }, { status: 403 });
    }

    // Return cached plan if exists and not forcing regeneration
    const body = await req.json().catch(() => ({}));
    const forceRegenerate = body.force === true;

    if (!forceRegenerate && dbUser.nutritionPlanData) {
      const planData = dbUser.nutritionPlanData as any;
      return NextResponse.json({ success: true, mealPlan: planData, cached: true });
    }

    const goal = dbUser.goal || "stay_fit";
    const dietType = dbUser.dietType || "vegetarian";
    const currentWeight = dbUser.currentWeight || 70;
    const targetWeight = dbUser.targetWeight || 65;
    const isWeightLoss = targetWeight < currentWeight;

    const dietInstruction = {
      vegetarian: "STRICTLY vegetarian. Use paneer, dal, curd, cheese, eggs optional. NO meat or fish.",
      non_vegetarian: "Include chicken, fish, eggs. Also use dal, paneer, curd.",
      vegan: "STRICTLY vegan. NO dairy, NO eggs, NO meat. Use tofu, plant milk, legumes.",
      no_preference: "Mix of vegetarian and non-vegetarian Indian foods.",
    }[dietType] || "Use healthy Indian foods.";

    const prompt = `You are an expert Indian nutritionist. Create a ${planDays}-day personalized meal plan.

USER PROFILE:
- Goal: ${goal.replace(/_/g, " ")}
- Diet Type: ${dietType} — ${dietInstruction}
- Current Weight: ${currentWeight}kg, Target: ${targetWeight}kg
- Direction: ${isWeightLoss ? "WEIGHT LOSS" : "MUSCLE GAIN"}

STRICT RULES:
1. Use ONLY authentic Indian foods with Indian names
2. ${planDays} days total — variety across all days
3. 4 meals per day: Breakfast, Lunch, Snack, Dinner
4. Daily calories: ${isWeightLoss ? "1400-1700" : "2200-2600"} kcal
5. High protein: ${isWeightLoss ? "80-100g" : "120-150g"} daily
6. Include exact quantity (e.g., "2 rotis", "1 katori dal", "100g chicken")
7. ${dietInstruction}

Respond ONLY with this exact JSON format, no extra text:
{
  "targetCalories": 1600,
  "targetProtein": 90,
  "planDays": ${planDays},
  "dietType": "${dietType}",
  "days": [
    {
      "day": 1,
      "totalCalories": 1580,
      "totalProtein": 88,
      "meals": [
        {
          "type": "Breakfast",
          "name": "Moong dal chilla with mint chutney",
          "calories": 320,
          "protein": 18,
          "carbs": 42,
          "fat": 6,
          "quantity": "2 chillas + 2 tbsp chutney",
          "prepTime": "15 mins"
        }
      ]
    }
  ]
}`;

    const responseText = await callAI(prompt);
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI returned invalid format");

    const mealPlan = JSON.parse(jsonMatch[0]);

    // Save to DB
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        nutritionPlanData: mealPlan as any,
        nutritionPlanGeneratedAt: new Date(),
        nutritionPlanDays: planDays,
      },
    });

    return NextResponse.json({ success: true, mealPlan, cached: false });
  } catch (error: any) {
    console.error("Nutrition generation error:", error);
    return NextResponse.json({
      error: "Failed to generate meal plan",
      details: error.message,
    }, { status: 500 });
  }
}