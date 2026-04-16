import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Buffer } from "buffer";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formData = await req.formData();

    const image = formData.get("image") as File | null;
    const mealType = (formData.get("mealType") as string) || "meal";

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be under 10MB" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Convert image to base64
    const arrayBuffer = await image.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = image.type || "image/jpeg";

    const { GoogleGenerativeAI } = await import("@google/generative-ai");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `You are an expert Indian nutritionist with deep knowledge of Indian cuisine.

Analyze this food image carefully. The user is from India so prioritize identifying Indian foods.
Indian foods to look for: paratha, roti, dal, sabzi, paneer, rice, idli, dosa, sambar, curry, rajma, chole, khichdi, upma, poha, etc.

Be specific about:
- Exact food name (e.g., "Aloo paratha with ghee")
- Realistic portion sizes
- Accurate calorie counts

Respond ONLY with JSON:
{
  "identified": true,
  "confidence": "high",
  "foodItems": [
    {
      "name": "Aloo Paratha",
      "quantity": "2 medium",
      "calories": 320,
      "protein": 7,
      "carbs": 48,
      "fat": 12
    }
  ],
  "totalCalories": { "min": 300, "max": 360 },
  "totalProtein": 7,
  "totalCarbs": 48,
  "totalFat": 12,
  "healthRating": "moderate",
  "healthNote": "Parathas are energy-dense.",
  "suggestion": "Pair with curd.",
  "mealType": "${mealType}"
}

If not identifiable:
{"identified": false, "error": "Cannot identify food clearly"}`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
      { text: prompt },
    ]);

    const responseText = result?.response?.text?.() || "";

    console.log("Gemini response:", responseText.slice(0, 200));

    // Clean response
    const cleaned = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json({
        success: false,
        message: "AI could not analyze the image. Try again.",
      });
    }

    const analysis = JSON.parse(jsonMatch[0]);

    if (!analysis.identified) {
      return NextResponse.json({
        success: false,
        message:
          analysis.error || "Could not identify food. Try clearer image.",
      });
    }

    const avgCalories = Math.round(
      ((analysis.totalCalories?.min || 0) +
        (analysis.totalCalories?.max || 0)) /
        2
    );

    // Save meal
    if (avgCalories > 0) {
      await prisma.meal.create({
        data: {
          userId: dbUser.id,
          name:
            analysis.foodItems?.map((f: any) => f.name).join(", ") ||
            "Analyzed meal",
          calories: avgCalories,
          protein: analysis.totalProtein || 0,
          carbs: analysis.totalCarbs || 0,
          fat: analysis.totalFat || 0,
          mealType,
        },
      });

      // Update daily calories
      const today = new Date().toISOString().split("T")[0];

      const existing = await prisma.dailyCalories.findUnique({
        where: {
          userId_date: {
            userId: dbUser.id,
            date: today,
          },
        },
      });

      if (existing) {
        const newEaten = existing.caloriesEaten + avgCalories;

        await prisma.dailyCalories.update({
          where: {
            userId_date: {
              userId: dbUser.id,
              date: today,
            },
          },
          data: {
            caloriesEaten: newEaten,
            netCalories: existing.caloriesBurned - newEaten,
          },
        });
      } else {
        await prisma.dailyCalories.create({
          data: {
            userId: dbUser.id,
            date: today,
            caloriesBurned: 0,
            caloriesEaten: avgCalories,
            netCalories: -avgCalories,
            workoutDone: false,
          },
        });
      }
    }

    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    console.error("Meal analysis error:", error);

    return NextResponse.json(
      {
        error: "Analysis failed",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}