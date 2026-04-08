// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

// const isPublicRoute = createRouteMatcher([
//   "/",
//   "/sign-in(.*)",
//   "/sign-up(.*)",
//   "/api/webhooks(.*)",
// ]);

// const hasValidClerkKeys =
//   typeof process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === "string" &&
//   process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_") &&
//   !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("xxxx") &&
//   typeof process.env.CLERK_SECRET_KEY === "string" &&
//   process.env.CLERK_SECRET_KEY.startsWith("sk_") &&
//   !process.env.CLERK_SECRET_KEY.includes("xxxx");

// const clerkHandler = clerkMiddleware((auth, request) => {
//   if (!isPublicRoute(request)) {
//     auth().protect();
//   }
// });

// export default function middleware(request: NextRequest, event: NextFetchEvent) {
//   if (!hasValidClerkKeys) {
//     return NextResponse.next();
//   }

//   return clerkHandler(request, event);
// }

// export const config = {
//   matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
// };



import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    const { userId } = await auth();

    if (!userId) {
      return auth().redirectToSignIn();
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
  ],
};















