import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return new NextResponse("User not found in Clerk", { status: 404 });
    }

    const email = clerkUser.emailAddresses?.[0]?.emailAddress;
    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();

    if (!email) {
      return new NextResponse("Email not found", { status: 400 });
    }

    // We use upsert on 'email' or 'clerkId'. 
    // Usually, syncing by clerkId is safer, but your error shows the email is the conflict.
    const user = await prisma.user.upsert({
      where: { 
        // If your schema allows it, upserting by email ensures 
        // you don't create two accounts for one email address.
        email: email 
      },
      update: {
        clerkId: userId, // Ensure the clerkId is linked/updated
        name: name || null,
      },
      create: {
        clerkId: userId,
        email: email,
        name: name || null,
      },
    });

    return NextResponse.json(user, { status: 200 });
  } catch (err) {
    console.error("SYNC ERROR:", err);
    // If it's still a constraint error, it means another field (like clerkId) is also unique and colliding
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
