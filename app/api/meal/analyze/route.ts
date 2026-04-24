import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Text-based fallback when image fails
async function estimateByText(food: string, context: string): Promise<any> {
  const p = `Indian nutritionist. Estimate nutrition for: "${food}". Context: ${context}
Return ONLY JSON: {"identified":true,"foodItems":[{"name":"${food}","quantity":"1 serving","calories":300,"protein":10,"carbs":40,"fat":8}],"totalCalories":{"min":270,"max":330},"totalProtein":10,"totalCarbs":40,"totalFat":8,"healthRating":"moderate","healthNote":"Nutritional estimate for ${food}.","suggestion":"Pair with vegetables for balanced nutrition."}`;

  if (process.env.GROQ_API_KEY) {
    const Groq = (await import("groq-sdk")).default;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const c = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: p }],
      max_tokens: 400,
    });
    const t = c.choices[0]?.message?.content || "";
    const m = t.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
  }
  throw new Error("Text estimation failed");
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const formData = await req.formData().catch(() => null);
    if (!formData) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

    const imageFile = formData.get("image") as File | null;
    const mealType = (formData.get("mealType") as string) || "meal";
    const foodHint = (formData.get("foodHint") as string) || "";

    const userCtx = `Goal: ${(dbUser.goal || "stay fit").replace(/_/g, " ")}, Diet: ${dbUser.dietType || "any"}, Weight: ${dbUser.currentWeight || "?"}kg`;

    // No image — use text estimation
    if (!imageFile || imageFile.size === 0) {
      if (foodHint) {
        const analysis = await estimateByText(foodHint, userCtx).catch(() => null);
        if (analysis) {
          await logMeal(dbUser.id, analysis, mealType, foodHint);
          return NextResponse.json({ success: true, analysis, method: "text" });
        }
      }
      return NextResponse.json({ error: "No image or food name provided" }, { status: 400 });
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 10MB" }, { status: 400 });
    }

    // Convert to base64
    const bytes = await imageFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = imageFile.type || "image/jpeg";

    if (!process.env.GEMINI_API_KEY) {
      // Fallback to text if no Gemini key
      if (foodHint) {
        const analysis = await estimateByText(foodHint, userCtx);
        await logMeal(dbUser.id, analysis, mealType, foodHint);
        return NextResponse.json({ success: true, analysis, method: "text_no_gemini" });
      }
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert Indian nutritionist analyzing a meal photo.
The user is from India. ${userCtx}

Analyze this food image carefully. Identify ALL visible food items.
For Indian foods, be specific: "Aloo Paratha" not just "flatbread", "Dal Tadka" not just "soup".
Estimate realistic portions visible in the image.
${foodHint ? `User hint: "${foodHint}" — use this to help identify the food.` : ""}

Return ONLY valid JSON, no markdown, no code blocks:
{"identified":true,"foodItems":[{"name":"Aloo Paratha","quantity":"2 medium parathas","calories":400,"protein":8,"carbs":58,"fat":15}],"totalCalories":{"min":350,"max":450},"totalProtein":8,"totalCarbs":58,"totalFat":15,"healthRating":"moderate","healthNote":"Parathas are energy-dense. Good pre-workout fuel.","suggestion":"Pair with curd/raita for protein boost."}

If no food visible: {"identified":false,"error":"No food detected. Please take a clearer photo in good lighting."}`;

    let analysis: any = null;
    let method = "gemini";

    try {
      // Correct format for @google/generative-ai package
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: mimeType,
            data: base64,
          },
        },
        prompt,
      ]);

      const raw = result.response.text();
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (m) analysis = JSON.parse(m[0]);
    } catch (geminiErr: any) {
      console.error("Gemini Vision failed:", geminiErr.message);

      // Fallback to text estimation
      if (foodHint) {
        try {
          analysis = await estimateByText(foodHint, userCtx);
          method = "text_fallback";
        } catch {
          return NextResponse.json({
            success: false,
            error: "Analysis failed",
            message: "Could not analyze. Please type the food name below.",
            canRetryWithText: true,
          }, { status: 500 });
        }
      } else {
        return NextResponse.json({
          success: false,
          error: "Image analysis failed",
          message: "Could not identify food. Please try: 1) Better lighting, 2) Closer shot, 3) Type food name below.",
          canRetryWithText: true,
        }, { status: 500 });
      }
    }

    if (!analysis?.identified) {
      return NextResponse.json({
        success: false,
        message: analysis?.error || "Could not identify food. Type the food name below.",
        canRetryWithText: true,
      });
    }

    await logMeal(dbUser.id, analysis, mealType, foodHint);

    const avgCal = Math.round(
      ((analysis.totalCalories?.min || 0) + (analysis.totalCalories?.max || 0)) / 2
    ) || analysis.foodItems?.reduce((s: number, f: any) => s + (f.calories || 0), 0) || 0;

    return NextResponse.json({
      success: true,
      analysis,
      method,
      caloriesLogged: avgCal,
      message: `✅ ${avgCal} calories logged to your diary`,
    });
  } catch (error: any) {
    console.error("Meal analyze error:", error);
    return NextResponse.json({
      error: "Server error",
      message: "Something went wrong. Please try again.",
      details: error.message,
    }, { status: 500 });
  }
}

async function logMeal(userId: string, analysis: any, mealType: string, foodHint: string) {
  const avgCal = Math.round(
    ((analysis.totalCalories?.min || 0) + (analysis.totalCalories?.max || 0)) / 2
  ) || 0;

  if (avgCal > 0) {
    await prisma.meal.create({
      data: {
        userId,
        name: analysis.foodItems?.map((f: any) => f.name).join(", ") || foodHint || "Analyzed meal",
        calories: avgCal,
        protein: analysis.totalProtein || 0,
        carbs: analysis.totalCarbs || 0,
        fat: analysis.totalFat || 0,
        mealType,
      },
    });
  }
}