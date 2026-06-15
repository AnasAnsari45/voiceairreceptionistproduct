import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Save tenant config + mark onboarding complete in Clerk publicMetadata.
  // Phase 2 will write this to Neon DB; for now Clerk is the source of truth.
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      onboardingComplete: true,
      tenantConfig: {
        niche: body.niche,
        name: body.name,
        phone: body.phone,
        address: body.address,
        hoursWeekdays: body.hoursWeekdays,
        hoursSaturday: body.hoursSaturday,
        faqs: body.faqs,
        personaName: body.personaName,
        greeting: body.greeting,
        createdAt: new Date().toISOString(),
      },
    },
  });

  return NextResponse.json({ success: true });
}
