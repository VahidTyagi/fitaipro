import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSubscriptionStatus } from "@/lib/subscription";

async function callGroq(prompt: string): Promise<string> {
  if (!process.env.GROQ_API_KEY) throw new Error("No GROQ_API_KEY");
  const Groq = (await import("groq-sdk")).default;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 3500,
  });
  const text = res.choices[0]?.message?.content || "";
  if (!text) throw new Error("Empty Groq response");
  return text;
}

async function callGemini(prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) throw new Error("No GEMINI_API_KEY");
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  if (!text) throw new Error("Empty Gemini response");
  return text;
}

const DIET_RULES: Record<string, string> = {
  vegetarian:     "STRICTLY vegetarian. Use paneer, dal, curd, eggs optional. NO meat or fish.",
  non_vegetarian: "Include chicken, fish, eggs along with dal, paneer, curd.",
  vegan:          "STRICTLY vegan. NO dairy, NO eggs, NO meat. Use tofu, soy milk, legumes.",
  no_preference:  "Healthy mix of balanced Indian foods.",
};

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ← READ BODY ONCE only
    let forceRegenerate = false;
    try {
      const body = await req.json();
      forceRegenerate = body?.force === true;
    } catch {
      forceRegenerate = false;
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const status = getSubscriptionStatus(dbUser);

    // Access control
    if (!status.isPaid && !status.isTrialActive) {
      return NextResponse.json({
        error: "access_denied",
        message: "Upgrade to Pro to generate diet plans.",
        upgradeRequired: true,
      }, { status: 403 });
    }

    const planDays = status.isPaid ? 30 : 7;

    // Return cached if not forcing
    if (!forceRegenerate && dbUser.nutritionPlanData) {
      return NextResponse.json({
        success: true,
        mealPlan: dbUser.nutritionPlanData,
        cached: true,
        planDays,
      });
    }

    // Build prompt
    const goal = dbUser.goal || "stay_fit";
    const dietType = dbUser.dietType || "vegetarian";
    const gender = dbUser.gender || "male";
    const age = dbUser.age || 25;
    const currentWeight = dbUser.currentWeight || 70;
    const targetWeight = dbUser.targetWeight || 65;
    const isWeightLoss = targetWeight < currentWeight;
    const dietRule = DIET_RULES[dietType] || DIET_RULES.no_preference;

    let calorieRange = isWeightLoss ? "1400-1700" : "2200-2600";
    let proteinRange = isWeightLoss ? "80-100g" : "120-150g";
    if (gender === "female") {
      calorieRange = isWeightLoss ? "1200-1500" : "1800-2100";
      proteinRange = isWeightLoss ? "70-90g" : "100-120g";
    }

    const prompt = `You are an expert Indian nutritionist.

USER:
- Gender: ${gender}, Age: ${age}
- Goal: ${goal.replace(/_/g, " ")}, Diet: ${dietType}
- Weight: ${currentWeight}kg → Target: ${targetWeight}kg
- Rule: ${dietRule}

Create a ${planDays}-day Indian meal plan.

RULES:
1. Heavier carbs at breakfast/lunch, lighter dinner
2. ${dietRule}
3. Daily calories: ${calorieRange}
4. Daily protein: ${proteinRange}
5. Use authentic Indian foods with exact quantities
6. For each meal: qualityScore (Poor/Moderate/Good/Excellent), timing (best time), whyGood (1 line), avoid (what not to pair)

Return ONLY valid JSON, no extra text:
{
  "targetCalories": 1600,
  "targetProtein": 90,
  "planDays": ${planDays},
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
          "timing": "7-9 AM",
          "whyGood": "High protein, easy to digest in morning",
          "avoid": "Avoid with fried snacks"
        }
      ]
    }
  ]
}`;

    let responseText = "";
    let aiUsed = "";

    try {
      responseText = await callGroq(prompt);
      aiUsed = "groq";
    } catch (e) {
      console.error("Groq failed:", e);
      try {
        responseText = await callGemini(prompt);
        aiUsed = "gemini";
      } catch (e2) {
        console.error("Gemini also failed:", e2);
        return NextResponse.json(
          { error: "AI temporarily unavailable. Try again in a moment." },
          { status: 503 }
        );
      }
    }

    // Parse AI response
    const cleaned = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in AI response:", cleaned.slice(0, 200));
      return NextResponse.json(
        { error: "AI returned invalid format. Please try again." },
        { status: 500 }
      );
    }

    let mealPlan: any;
    try {
      mealPlan = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

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
    console.error("Nutrition generate error:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 }
    );
  }
}