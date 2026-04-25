import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ payments: [] }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ payments: [] });

    const payments = await prisma.payment.findMany({
      where: { userId: dbUser.id, status: "paid" },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ payments });
  } catch {
    return NextResponse.json({ payments: [] });
  }
}