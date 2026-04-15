import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSubscriptionStatus } from "@/lib/subscription";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const status = getSubscriptionStatus(dbUser);

    // Feature access check
    if (!status.isPaid && !status.isTrialActive) {
      return NextResponse.json({
        error: "upgrade_required",
        message: "Meal photo analysis requires a Pro plan.",
      }, { status: 403 });
    }

    const formData = await req.formData();
    const image = formData.get("image") as File;
    const mealType = formData.get("mealType") as string || "meal";

    if (!image) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    // Convert to base64
    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = image.type || "image/jpeg";

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert Indian nutritionist analyzing a food photo. The user is from India.
    
Analyze this ${mealType} image and provide nutritional estimates.
Focus on Indian foods if present (dal, roti, rice, sabzi, paneer, curry etc).
If multiple items, analyze each separately.

Respond ONLY with valid JSON, no other text:
{
  "identified": true,
  "foodItems": [
    {
      "name": "Dal tadka",
      "quantity": "1 katori (150g)",
      "calories": 180,
      "protein": 9,
      "carbs": 25,
      "fat": 5,
      "confidence": "high"
    }
  ],
  "totalCalories": { "min": 380, "max": 450 },
  "totalProtein": 22,
  "totalCarbs": 65,
  "totalFat": 12,
  "healthRating": "good",
  "healthNote": "High protein, balanced meal. Good for your weight loss goal.",
  "suggestion": "Consider adding a small salad to increase fiber intake.",
  "mealType": "${mealType}"
}

If image is not food, respond with: {"identified": false, "error": "No food detected in image"}`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
      prompt,
    ]);

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");

    const analysis = JSON.parse(jsonMatch[0]);

    if (!analysis.identified) {
      return NextResponse.json({
        success: false,
        message: "Could not identify food in the image. Please take a clearer photo.",
      });
    }

    // Log meal to DB if analysis successful
    if (analysis.totalCalories && dbUser) {
      const avgCalories = Math.round(
        (analysis.totalCalories.min + analysis.totalCalories.max) / 2
      );
      await prisma.meal.create({
        data: {
          userId: dbUser.id,
          name: analysis.foodItems.map((f: any) => f.name).join(", "),
          calories: avgCalories,
          protein: analysis.totalProtein || 0,
          carbs: analysis.totalCarbs || 0,
          fat: analysis.totalFat || 0,
          mealType: mealType || "meal",
        },
      });
    }

    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    console.error("Meal analysis error:", error);
    return NextResponse.json({
      error: "Failed to analyze meal",
      details: error.message,
    }, { status: 500 });
  }
}