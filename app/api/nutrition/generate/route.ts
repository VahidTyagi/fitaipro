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
    temperature: 0.6,
    max_tokens: 4000,  // Reduced to prevent truncation
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

function buildPrompt(
  gender: string,
  age: number,
  goal: string,
  dietType: string,
  currentWeight: number,
  targetWeight: number,
  daysToGenerate: number
): string {
  const isWeightLoss = targetWeight < currentWeight;
  const isFemale = gender === "female";

  const calorieRange = isFemale
    ? isWeightLoss ? "1200-1500" : "1800-2100"
    : isWeightLoss ? "1400-1700" : "2200-2600";

  const proteinRange = isFemale
    ? isWeightLoss ? "70-90" : "100-120"
    : isWeightLoss ? "80-100" : "120-150";

  const dietRules: Record<string, string> = {
    vegetarian:     "Vegetarian only. Use paneer, dal, curd, eggs, tofu. No meat.",
    non_vegetarian: "Include chicken, fish, eggs, dal, paneer.",
    vegan:          "Strictly vegan. No dairy, no eggs, no meat.",
    no_preference:  "Healthy balanced Indian diet.",
  };

  return `Indian nutritionist creating a ${daysToGenerate}-day meal plan.

User: ${gender}, age ${age}, ${currentWeight}kg → ${targetWeight}kg, goal: ${goal}
Diet: ${dietRules[dietType] || dietRules.no_preference}
Calories: ${calorieRange} kcal/day, Protein: ${proteinRange}g/day

IMPORTANT: Return ONLY valid compact JSON. No markdown, no explanation.
Keep meal names SHORT (max 5 words). Keep descriptions minimal.

{
  "targetCalories": 1600,
  "targetProtein": 90,
  "planDays": ${daysToGenerate},
  "days": [
    {
      "day": 1,
      "totalCalories": 1580,
      "totalProtein": 88,
      "meals": [
        {
          "type": "Breakfast",
          "name": "Moong dal chilla",
          "calories": 320,
          "protein": 18,
          "carbs": 42,
          "fat": 6,
          "quantity": "2 chillas + 2 tbsp chutney",
          "qualityScore": "Excellent",
          "timing": "7-9 AM",
          "whyGood": "High protein morning meal",
          "avoid": "Skip fried sides"
        }
      ]
    }
  ]
}`;
}

function safeParseJSON(text: string): any {
  // Clean the response
  let cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control chars
    .trim();

  // Find the JSON object
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in response");
  }

  cleaned = cleaned.slice(start, end + 1);

  try {
    return JSON.parse(cleaned);
  } catch (e: any) {
    // Try to fix common JSON issues
    // Fix trailing commas
    cleaned = cleaned
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]");

    try {
      return JSON.parse(cleaned);
    } catch (e2: any) {
      throw new Error(`JSON parse failed: ${e2.message}`);
    }
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read body once
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

    if (!status.isPaid && !status.isTrialActive) {
      return NextResponse.json({
        error: "access_denied",
        message: "Upgrade to Pro to generate diet plans.",
        upgradeRequired: true,
      }, { status: 403 });
    }

    const planDays = status.isPaid ? 30 : 7;

    // Return cached unless forced
    if (!forceRegenerate && dbUser.nutritionPlanData) {
      return NextResponse.json({
        success: true,
        mealPlan: dbUser.nutritionPlanData,
        cached: true,
        planDays,
      });
    }

    // Generate 3 days at a time to avoid JSON truncation
    // Then duplicate/rotate for full plan
    const DAYS_PER_BATCH = 3;
    const prompt = buildPrompt(
      dbUser.gender || "male",
      dbUser.age || 25,
      (dbUser.goal || "stay_fit").replace(/_/g, " "),
      dbUser.dietType || "vegetarian",
      dbUser.currentWeight || 70,
      dbUser.targetWeight || 65,
      DAYS_PER_BATCH
    );

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

    let basePlan: any;
    try {
      basePlan = safeParseJSON(responseText);
    } catch (parseErr: any) {
      console.error("Parse error. Raw response (first 500):", responseText.slice(0, 500));
      return NextResponse.json(
        { error: "AI returned invalid format. Please try again." },
        { status: 500 }
      );
    }

    if (!basePlan.days || !Array.isArray(basePlan.days) || basePlan.days.length === 0) {
      return NextResponse.json(
        { error: "AI response missing meal data. Please try again." },
        { status: 500 }
      );
    }

    // Expand to full plan days by rotating the 3-day base
    const fullDays = [];
    for (let i = 0; i < planDays; i++) {
      const baseDay = basePlan.days[i % basePlan.days.length];
      fullDays.push({
        ...baseDay,
        day: i + 1,
      });
    }

    const mealPlan = {
      ...basePlan,
      planDays,
      days: fullDays,
    };

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

