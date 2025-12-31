import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  // Params-ийг Promise гэж тодорхойлно
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // ЭНД: params-ийг await хийж задлах ёстой
    const { id } = await params;

    const quiz = await prisma.quiz.findUnique({
      where: { id: id }, // Одоо id нь undefined биш болсон
      include: { article: true },
    });

    if (!quiz) return new NextResponse("Quiz not found", { status: 404 });

    return NextResponse.json(quiz);
  } catch (err) {
    console.error("GET QUIZ ERROR:", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
