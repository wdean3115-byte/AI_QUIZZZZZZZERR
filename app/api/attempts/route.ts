import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

    const { quizId, userAnswers, score } = await req.json();

    // Prisma User ID-г олох (Clerk ID-гаар биш баазын ID-гаар хадгална)
    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!dbUser) return new NextResponse("User not found", { status: 404 });

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId: dbUser.id,
        userAnswers,
        score: parseInt(score),
      },
    });

    return NextResponse.json(attempt, { status: 201 });
  } catch (err) {
    console.error("ATTEMPT ERROR:", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
