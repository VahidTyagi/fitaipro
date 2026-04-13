import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function callAI(prompt: string): Promise<string> {
  if (process.env.GROQ_API_KEY) {
    try {
      const Groq = (await import("groq-sdk")).default;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 3000,
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

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const trialEnd = dbUser.trialEnd ? new Date(dbUser.trialEnd) : null;
    const trialActive = trialEnd ? trialEnd > new Date() : false;
    const isPaid = dbUser.plan === "pro" || dbUser.plan === "elite";
    if (!trialActive && !isPaid) return NextResponse.json({ error: "Trial expired" }, { status: 403 });

    const goal = dbUser.goal || "stay_fit";
    const dietType = dbUser.dietType || "vegetarian";
    const currentWeight = dbUser.currentWeight || 70;
    const targetWeight = dbUser.targetWeight || 65;
    const isWeightLoss = targetWeight < currentWeight;

    const prompt = `You are an expert Indian nutritionist. Create a 7-day meal plan.
USER: Goal: ${goal.replace(/_/g, " ")}, Diet: ${dietType}, Current: ${currentWeight}kg, Target: ${targetWeight}kg
RULES: Use authentic Indian foods. Include breakfast, lunch, snack, dinner. Daily calories: ${isWeightLoss ? "1600-1800" : "2200-2500"} kcal. ${dietType === "vegetarian" ? "NO meat/fish." : ""}${dietType === "vegan" ? "NO dairy/meat/eggs." : ""}
Respond ONLY with valid JSON:
{"targetCalories":1700,"targetProtein":120,"days":[{"day":1,"totalCalories":1680,"totalProtein":95,"meals":[{"type":"Breakfast","name":"Moong dal chilla","calories":320,"protein":18,"carbs":42,"fat":6,"quantity":"2 pieces"}]}]}`;

    const responseText = await callAI(prompt);
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");
    const mealPlan = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ success: true, mealPlan });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate meal plan" }, { status: 500 });
  }
}