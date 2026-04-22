import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Fallback: text-based calorie estimation when image fails
async function estimateFromText(foodName: string, userContext: string): Promise<any> {
  const prompt = `You are an expert Indian nutritionist.
Estimate nutrition for: "${foodName}"
User context: ${userContext}

Respond ONLY with JSON:
{
  "identified": true,
  "foodItems": [{"name": "Aloo Paratha", "quantity": "1 medium", "calories": 200, "protein": 4, "carbs": 30, "fat": 8}],
  "totalCalories": {"min": 180, "max": 220},
  "totalProtein": 4, "totalCarbs": 30, "totalFat": 8,
  "healthRating": "moderate",
  "healthNote": "Parathas are energy-dense. Good pre-workout.",
  "suggestion": "Pair with curd for protein."
}`;

  if (process.env.GROQ_API_KEY) {
    const Groq = (await import("groq-sdk")).default;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const c = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });
    const text = c.choices[0]?.message?.content || "";
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  }
  throw new Error("No AI available for text estimation");
}

async function analyzeImageWithGemini(base64: string, mimeType: string, mealType: string, userContext: string): Promise<any> {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are an expert Indian nutritionist analyzing a meal photo.
${userContext}

Analyze this ${mealType} image carefully. The user is from India.
Look for Indian foods: paratha, roti, dal, sabzi, paneer, rice, curry, idli, dosa, sambar, etc.

Be specific - if you see paratha, identify if it's Aloo/Gobi/Mooli paratha.
Estimate realistic Indian portion sizes.

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "identified": true,
  "foodItems": [
    {
      "name": "Aloo Paratha",
      "quantity": "2 medium parathas",
      "calories": 320,
      "protein": 7,
      "carbs": 48,
      "fat": 12
    }
  ],
  "totalCalories": {"min": 300, "max": 360},
  "totalProtein": 7,
  "totalCarbs": 48,
  "totalFat": 12,
  "healthRating": "moderate",
  "healthNote": "Good energy meal. High in carbs.",
  "suggestion": "Add curd for protein and probiotics."
}

If no food visible: {"identified": false, "error": "No food detected. Please take a clearer photo in good lighting."}`;

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: mimeType as any,
        data: base64,
      },
    },
    { text: prompt },
  ]);

  const raw = result.response.text();

  // Clean response thoroughly
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .replace(/^\s*[\w\s]+:\s*\n/gm, "") // Remove "Response:" type prefixes
    .trim();

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Gemini returned non-JSON response");

  return JSON.parse(match[0]);
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Parse form data
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({
        error: "Invalid request",
        message: "Could not parse form data. Ensure you're sending multipart/form-data.",
      }, { status: 400 });
    }

    const image = formData.get("image") as File | null;
    const mealType = (formData.get("mealType") as string) || "meal";
    const foodHint = (formData.get("foodHint") as string) || ""; // optional user hint

    const userContext = `User goal: ${dbUser.goal?.replace(/_/g, " ") || "stay fit"}, Diet: ${dbUser.dietType || "any"}, Weight: ${dbUser.currentWeight || "?"}kg → ${dbUser.targetWeight || "?"}kg`;

    // If no image but food hint provided — use text-based estimation
    if (!image || image.size === 0) {
      if (foodHint) {
        try {
          const analysis = await estimateFromText(foodHint, userContext);
          return NextResponse.json({ success: true, analysis, method: "text" });
        } catch (e: any) {
          return NextResponse.json({ error: "Estimation failed", details: e.message }, { status: 500 });
        }
      }
      return NextResponse.json({ error: "No image or food name provided" }, { status: 400 });
    }

    // Validate image
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large. Maximum 10MB." }, { status: 400 });
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    const mimeType = image.type || "image/jpeg";
    if (!validTypes.includes(mimeType)) {
      return NextResponse.json({ error: `Unsupported image type: ${mimeType}. Use JPEG, PNG, or WebP.` }, { status: 400 });
    }

    // Convert to base64
    const arrayBuffer = await image.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    let analysis: any;
    let method = "gemini";

    // Try Gemini Vision first
    try {
      analysis = await analyzeImageWithGemini(base64, mimeType, mealType, userContext);
    } catch (geminiErr: any) {
      console.error("Gemini Vision failed:", geminiErr.message);

      // If Gemini fails and user provided a food hint, fallback to text
      if (foodHint) {
        try {
          analysis = await estimateFromText(foodHint, userContext);
          method = "text_fallback";
        } catch {
          return NextResponse.json({
            error: "Analysis failed",
            message: "Could not analyze image. Please try again or type the food name.",
            details: geminiErr.message,
          }, { status: 500 });
        }
      } else {
        return NextResponse.json({
          error: "Image analysis failed",
          message: "Could not identify food. Please take a clearer photo or type the food name below.",
          canRetryWithText: true,
        }, { status: 500 });
      }
    }

    if (!analysis?.identified) {
      return NextResponse.json({
        success: false,
        message: analysis?.error || "Could not identify food. Try better lighting or type food name.",
        canRetryWithText: true,
      });
    }

    // Calculate average calories
    const avgCalories = Math.round(
      ((analysis.totalCalories?.min || 0) + (analysis.totalCalories?.max || 0)) / 2
    ) || analysis.foodItems?.reduce((s: number, f: any) => s + (f.calories || 0), 0) || 0;

    // Log to meal DB
    if (avgCalories > 0) {
      await prisma.meal.create({
        data: {
          userId: dbUser.id,
          name: analysis.foodItems?.map((f: any) => f.name).join(", ") || foodHint || "Analyzed meal",
          calories: avgCalories,
          protein: analysis.totalProtein || 0,
          carbs: analysis.totalCarbs || 0,
          fat: analysis.totalFat || 0,
          mealType,
        },
      });

      // Update daily calorie tracker
      const today = new Date().toISOString().split("T")[0];
      try {
        const existing = await (prisma as any).dailyCalories?.findUnique?.({
          where: { userId_date: { userId: dbUser.id, date: today } },
        });
        if (existing) {
          await (prisma as any).dailyCalories?.update?.({
            where: { userId_date: { userId: dbUser.id, date: today } },
            data: {
              caloriesEaten: existing.caloriesEaten + avgCalories,
              netCalories: existing.caloriesBurned - (existing.caloriesEaten + avgCalories),
            },
          });
        }
      } catch {
        // Daily calorie table might not exist yet — non-blocking
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      method,
      caloriesLogged: avgCalories,
      message: `✅ ${avgCalories} calories logged to your diary`,
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