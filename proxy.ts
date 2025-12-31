import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Нэвтрэх шаардлагагүй хуудсууд
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect(); // auth() биш, шууд auth.protect() ашиглана
  }
});

export const config = {
  matcher: [
    // Next.js-ийн дотоод файлууд болон статик файлуудаас бусад бүх хүсэлтийг шалгана
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",

    "/(api|trpc)(.*)",
  ],
};
