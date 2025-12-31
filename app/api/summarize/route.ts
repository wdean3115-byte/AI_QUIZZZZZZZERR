import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; // getAuth биш auth
import { prisma } from "@/lib/prisma";
import { genAI } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    // 1. auth() функцийг await хийж ашиглана
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, content, maxLength = 150 } = await req.json();
    if (!title || !content) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return new NextResponse("User not synced", { status: 409 });
    }

    // 2. Моделийн нэрийг шалгах (gemini-1.5-flash эсвэл gemini-2.0-flash-exp)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(
      `Доорх нийтлэлийг ${maxLength} үгнээс хэтрэхгүйгээр хураангуйлж бич:\n\n${content}`
    );

    const summary = result.response.text();

    const article = await prisma.article.create({
      data: {
        title,
        content,
        summary,
        userId: dbUser.id,
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (err) {
    console.error("SUMMARIZE ERROR:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
