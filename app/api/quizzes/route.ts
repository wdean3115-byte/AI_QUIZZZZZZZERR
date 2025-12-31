import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { geminiModel } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { articleId } = await req.json();

    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article || !article.summary) {
      return new NextResponse("Article not found", { status: 404 });
    }

    const prompt = `
      Дараах текст дээр үндэслэн 5 асуулттай quiz үүсгэ. 
      JSON форматтай байх ёстой. Илүү текст бичиж болохгүй.
      Бүтэц:
      [
        {
          "question": "Асуултын текст",
          "options": ["Сонголт 1", "Сонголт 2", "Сонголт 3", "Сонголт 4"],
          "answer": "Зөв хариултын текст (options доторх үгтэй яг ижил байх)"
        }
      ]

      Текст: ${article.summary}
    `;

    const result = await geminiModel.generateContent(prompt);
    const text = result.response
      .text()
      .replace(/```json|```/g, "")
      .trim();
    const questions = JSON.parse(text);

    const quiz = await prisma.quiz.create({
      data: {
        articleId,
        questions,
      },
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (err) {
    console.error("QUIZ ERROR:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
