import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/(.*)",
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();

  // Unauthenticated: protect all non-public routes
  if (!userId && !isPublicRoute(request)) {
    return (await auth()).redirectToSignIn();
  }

  if (userId) {
    const onboardingComplete =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      !!(sessionClaims as any)?.publicMetadata?.onboardingComplete;

    // Signed in, on the landing page → route them to the right place
    if (request.nextUrl.pathname === "/") {
      return NextResponse.redirect(
        new URL(onboardingComplete ? "/dashboard" : "/onboarding", request.url)
      );
    }

    // Signed in, onboarding not done → force to /onboarding
    if (!onboardingComplete && !isOnboardingRoute(request) && !isPublicRoute(request)) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    // Signed in, onboarding done, trying to access /onboarding → send to dashboard
    if (onboardingComplete && isOnboardingRoute(request)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
