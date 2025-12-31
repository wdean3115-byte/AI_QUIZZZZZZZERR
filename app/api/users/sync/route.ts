import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server"; // auth болон currentUser ашиглана
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request) {
  try {
    const { userId } = await auth(); // await нэмсэн

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Хэрэглэгч баазад аль хэдийн байгаа эсэхийг шалгах
    const existing = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    // Clerk-ээс хэрэглэгчийн дэлгэрэнгүй мэдээллийг авах
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return new NextResponse("User not found in Clerk", { status: 404 });
    }

    const email = clerkUser.emailAddresses?.[0]?.emailAddress;
    const name = `${clerkUser.firstName || ""} ${
      clerkUser.lastName || ""
    }`.trim();

    const user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: email,
        name: name || null,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error("SYNC ERROR:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
