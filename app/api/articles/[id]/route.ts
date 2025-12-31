import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        quizzes: {
          include: {
            attempts: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    if (!article) return new NextResponse("Article not found", { status: 404 });

    return NextResponse.json(article);
  } catch (err) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
