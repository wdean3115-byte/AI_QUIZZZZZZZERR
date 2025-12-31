import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
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

    // upsert ашиглах - байвал update, байхгүй бол create
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email: email,
        name: name || null,
      },
      create: {
        clerkId: userId,
        email: email,
        name: name || null,
      },
    });

    return NextResponse.json(user, { status: existing ? 200 : 201 });
  } catch (err) {
    console.error("SYNC ERROR:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
