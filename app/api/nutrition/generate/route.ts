import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSubscriptionStatus } from "@/lib/subscription";

async function generateWithGroq(prompt: string): Promise<string> {
  if (!process.env.GROQ_API_KEY) throw new Error("No Groq key");
  const Groq = (await import("groq-sdk")).default;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const c = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 3500,
  });
  const t = c.choices[0]?.message?.content || "";
  if (!t) throw new Error("Empty Groq response");
  return t;
}

async function generateWithGemini(prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) throw new Error("No Gemini key");
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const t = result.response.text();
  if (!t) throw new Error("Empty Gemini response");
  return t;
}

function getPlanDays(plan: string, isTrialActive: boolean): number {
  if (plan === "pro" || plan === "elite") return 30;
  if (isTrialActive) return 7;
  return 0;
}

const DIET_RULES: Record<string, string> = {
  vegetarian: "STRICTLY vegetarian. Use paneer, dal, curd, tofu, eggs optional. NO meat or fish.",
  non_vegetarian: "Include chicken, fish, eggs. Also use dal, paneer, curd.",
  vegan: "STRICTLY vegan. NO dairy, NO eggs, NO meat. Use tofu, soy milk, legumes, nuts.",
  no_preference: "Healthy mix of Indian foods.",
};

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

    let forceRegenerate = false;
    try {
      const body = await req.json();
      forceRegenerate = body?.force === true;
    } catch {
      forceRegenerate = false;
    }

    if (!forceRegenerate && dbUser.nutritionPlanData) {
      return NextResponse.json({
        success: true,
        mealPlan: dbUser.nutritionPlanData,
        cached: true,
        planDays,
      });
    }

    const goal = dbUser.goal || "stay_fit";
    const dietType = dbUser.dietType || "vegetarian";
    const gender = dbUser.gender || "male";
    const age = dbUser.age || 25;
    const currentWeight = dbUser.currentWeight || 70;
    const targetWeight = dbUser.targetWeight || 65;
    const isWeightLoss = targetWeight < currentWeight;
    const dietRule = DIET_RULES[dietType] || DIET_RULES.no_preference;

    // Gender + age based targets
    let calorieRange = isWeightLoss ? "1400-1700" : "2200-2600";
    let proteinRange = isWeightLoss ? "80-100g" : "120-150g";
    if (gender === "female") {
      calorieRange = isWeightLoss ? "1200-1500" : "1800-2100";
      proteinRange = isWeightLoss ? "70-90g" : "100-120g";
    }
    if (age >= 60) {
      calorieRange = "1400-1800";
      proteinRange = "80-100g"; // seniors need more protein
    }

    const prompt = `You are an expert Indian nutritionist and dietitian.

USER PROFILE:
- Gender: ${gender}, Age: ${age}
- Goal: ${goal.replace(/_/g, " ")}, Diet: ${dietType}
- Weight: ${currentWeight}kg → Target: ${targetWeight}kg
- Diet rule: ${dietRule}

Create a 7-day INTELLIGENT Indian meal plan with MEAL TIMING INTELLIGENCE.

KEY RULES:
1. Aloo Paratha is GOOD for breakfast (high energy for day), BAD for dinner (too heavy at night)
2. Heavier meals at breakfast/lunch, lighter at dinner
3. Post-workout meal must be HIGH protein
4. Pre-bed meal should be light protein (curd, boiled egg, dal)
5. ${dietRule}
6. Daily calories: ${calorieRange}
7. Daily protein: ${proteinRange}
8. Use ONLY authentic Indian foods with exact quantities

For EVERY meal include:
- "qualityScore": "Poor" | "Moderate" | "Good" | "Excellent"
- "timing": best time advice for this specific meal
- "whyGood": one line why this meal is appropriate at this time
- "avoid": what NOT to pair with this meal

Return ONLY valid JSON, no extra text:
{
  "targetCalories": 1600,
  "targetProtein": 90,
  "planDays": ${planDays},
  "dietType": "${dietType}",
  "gender": "${gender}",
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
          "qualityScore": "Excellent",
          "timing": "7–9 AM — Best as morning fuel",
          "whyGood": "High protein, light on stomach, quick to digest",
          "avoid": "Avoid with fried foods or heavy sweets"
        }
      ]
    }
  ]
}`;

    let responseText = "";
    let aiUsed = "";

    try {
      responseText = await generateWithGroq(prompt);
      aiUsed = "groq";
    } catch (e) {
      console.log("Groq failed:", e);
      try {
        responseText = await generateWithGemini(prompt);
        aiUsed = "gemini";
      } catch (e2) {
        console.error("Both AI failed:", e2);
        return NextResponse.json({
          error: "AI unavailable",
          details: "Both Groq and Gemini failed. Check API keys.",
        }, { status: 503 });
      }
    }

    const cleaned = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    let mealPlan;
    try {
      mealPlan = JSON.parse(match[0]);
    } catch {
      return NextResponse.json({ error: "JSON parse failed" }, { status: 500 });
    }

    mealPlan.planDays = planDays;

    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        nutritionPlanData: mealPlan as any,
        nutritionPlanGeneratedAt: new Date(),
        nutritionPlanDays: planDays,
      },
    });

    return NextResponse.json({
      success: true,
      mealPlan,
      cached: false,
      aiUsed,
      planDays,
    });
  } catch (error: any) {
    console.error("Nutrition error:", error);
    return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
  }
}