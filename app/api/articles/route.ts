import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; // auth ашиглах
import { prisma } from "@/lib/prisma";
import { geminiModel } from "@/lib/gemini"; // lib/gemini-д тодорхойлсон модел

export async function POST(req: Request) {
  try {
    const { userId } = await auth(); // await нэмсэн
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { title, content } = await req.json();

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return new NextResponse("User not synced. Please refresh page.", {
        status: 409,
      });
    }

    // Gemini ашиглан хураангуйлах
    const result = await geminiModel.generateContent(
      `Дараах нийтлэлийг 3-6 өгүүлбэрт багтаан товч хураангуйл:\n\n${content}`
    );

    const summary = result.response.text();

    const article = await prisma.article.create({
      data: {
        title,
        content,
        summary,
        userId: dbUser.id, // Prisma-ийн дотоод ID
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (err) {
    console.error("ARTICLE ERROR:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
