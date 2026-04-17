import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSubscriptionStatus } from "@/lib/subscription";

async function generateWithGroq(prompt: string): Promise<string> {
  if (!process.env.GROQ_API_KEY) throw new Error("No Groq key");
  const Groq = (await import("groq-sdk")).default;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 3000,
  });
  const text = completion.choices[0]?.message?.content || "";
  if (!text) throw new Error("Empty response from Groq");
  return text;
}

async function generateWithGemini(prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) throw new Error("No Gemini key");
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

function getPlanDays(plan: string, isTrialActive: boolean): number {
  if (plan === "pro" || plan === "elite") return 30;
  if (isTrialActive) return 7;
  return 0;
}

const DIET_RULES: Record<string, string> = {
  vegetarian: "STRICTLY vegetarian. Use paneer, dal, curd, vegetables. NO meat or fish.",
  non_vegetarian: "Include chicken, eggs, fish. Also use dal, paneer, curd.",
  vegan: "STRICTLY vegan. NO dairy, NO eggs, NO meat. Use tofu, soy milk, legumes.",
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

    // Parse body safely
    let forceRegenerate = false;
    try {
      const body = await req.json();
      forceRegenerate = body?.force === true;
    } catch {
      forceRegenerate = false;
    }

    // Return cached plan if available and not forcing
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
    const currentWeight = dbUser.currentWeight || 70;
    const targetWeight = dbUser.targetWeight || 65;
    const isWeightLoss = targetWeight < currentWeight;
    const dietRule = DIET_RULES[dietType] || DIET_RULES.no_preference;

    // Always generate 7 days (prevent timeout), mark total as planDays
    const generateDays = 7;

    const prompt = `You are an expert Indian nutritionist. Create a ${generateDays}-day meal plan.

USER: Goal=${goal.replace(/_/g, " ")}, Diet=${dietType}, Weight=${currentWeight}kg→${targetWeight}kg
DIET RULE: ${dietRule}
CALORIES: ${isWeightLoss ? "1500-1700" : "2200-2500"} kcal/day
PROTEIN: ${isWeightLoss ? "80-100g" : "120-150g"}/day

RULES:
- Use ONLY authentic Indian foods with proper names
- 4 meals: Breakfast, Lunch, Snack, Dinner
- Include exact quantities (2 rotis, 1 katori, 100g etc)
- Vary meals across all ${generateDays} days

Return ONLY valid JSON, no extra text:
{"targetCalories":1600,"targetProtein":90,"planDays":${planDays},"dietType":"${dietType}","days":[{"day":1,"totalCalories":1580,"totalProtein":88,"meals":[{"type":"Breakfast","name":"Moong dal chilla with mint chutney","calories":320,"protein":18,"carbs":42,"fat":6,"quantity":"2 chillas + 2 tbsp chutney"}]}]}`;

    let responseText = "";
    let aiUsed = "";

    try {
      responseText = await generateWithGroq(prompt);
      aiUsed = "groq";
    } catch (groqErr) {
      console.log("Groq failed:", groqErr);
      try {
        responseText = await generateWithGemini(prompt);
        aiUsed = "gemini";
      } catch (geminiErr) {
        console.error("Both AI failed:", geminiErr);
        return NextResponse.json({
          error: "AI service unavailable",
          details: "Both Groq and Gemini failed. Check API keys and network.",
        }, { status: 503 });
      }
    }

    // Clean and parse JSON
    const cleaned = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({
        error: "Invalid AI response format",
        details: "AI returned non-JSON response",
      }, { status: 500 });
    }

    let mealPlan;
    try {
      mealPlan = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ error: "JSON parse failed" }, { status: 500 });
    }

    // Ensure planDays is set correctly
    mealPlan.planDays = planDays;

    // Save to DB
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
    console.error("Nutrition route error:", error);
    return NextResponse.json({
      error: "Server error",
      details: error.message,
    }, { status: 500 });
  }
}