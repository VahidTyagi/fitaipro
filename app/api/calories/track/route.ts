import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { caloriesBurned, caloriesEaten, workoutDone } = await req.json();
    const today = getTodayDate();

    const existing = await prisma.dailyCalories.findUnique({
      where: { userId_date: { userId: dbUser.id, date: today } },
    });

    let record;
    if (existing) {
      const newBurned = (existing.caloriesBurned || 0) + (caloriesBurned || 0);
      const newEaten = caloriesEaten !== undefined ? caloriesEaten : existing.caloriesEaten;
      record = await prisma.dailyCalories.update({
        where: { userId_date: { userId: dbUser.id, date: today } },
        data: {
          caloriesBurned: newBurned,
          caloriesEaten: newEaten,
          netCalories: newBurned - newEaten,
          workoutDone: workoutDone || existing.workoutDone,
        },
      });
    } else {
      const burned = caloriesBurned || 0;
      const eaten = caloriesEaten || 0;
      record = await prisma.dailyCalories.create({
        data: {
          userId: dbUser.id,
          date: today,
          caloriesBurned: burned,
          caloriesEaten: eaten,
          netCalories: burned - eaten,
          workoutDone: workoutDone || false,
        },
      });
    }

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Get last 30 days
    const records = await prisma.dailyCalories.findMany({
      where: { userId: dbUser.id },
      orderBy: { date: "desc" },
      take: 30,
    });

    const today = getTodayDate();
    const todayRecord = records.find((r) => r.date === today) || {
      caloriesBurned: 0,
      caloriesEaten: 0,
      netCalories: 0,
      workoutDone: false,
    };

    const totalDeficit = records.reduce((sum, r) => sum + (r.netCalories || 0), 0);
    const avgDailyDeficit = records.length > 0 ? Math.round(totalDeficit / records.length) : 0;

    return NextResponse.json({
      today: todayRecord,
      history: records,
      totalDeficit,
      avgDailyDeficit,
      daysTracked: records.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}