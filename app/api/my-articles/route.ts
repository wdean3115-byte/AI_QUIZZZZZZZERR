import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; // getAuth биш auth-ийг импортлоно
import { prisma } from "@/lib/prisma";

export async function GET() {
  // req параметр энд заавал хэрэггүй
  try {
    const { userId } = await auth(); // await auth() ашиглана

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const articles = await prisma.article.findMany({
      where: {
        user: {
          clerkId: userId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error("MY_ARTICLES_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
