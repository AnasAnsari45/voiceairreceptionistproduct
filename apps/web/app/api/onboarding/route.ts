import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Upsert tenant — safe to call again if the user re-submits onboarding
  const tenant = await prisma.tenant.upsert({
    where: { clerkUserId: userId },
    create: {
      clerkUserId: userId,
      name: body.name,
      contactPhone: body.phone ?? null,
      location: body.address ?? null,
      hoursJson: {
        weekdays: body.hoursWeekdays ?? "",
        saturday: body.hoursSaturday ?? "",
      },
      nicheTemplate: body.niche ?? null,
      persona: `a professional and helpful receptionist named ${body.personaName}`,
      greeting: body.greeting ?? null,
    },
    update: {
      name: body.name,
      contactPhone: body.phone ?? null,
      location: body.address ?? null,
      hoursJson: {
        weekdays: body.hoursWeekdays ?? "",
        saturday: body.hoursSaturday ?? "",
      },
      nicheTemplate: body.niche ?? null,
      persona: `a professional and helpful receptionist named ${body.personaName}`,
      greeting: body.greeting ?? null,
    },
  });

  // Replace FAQs: wipe existing rows, insert fresh set
  await prisma.knowledge.deleteMany({ where: { tenantId: tenant.id } });

  const faqs: { q: string; a: string }[] = Array.isArray(body.faqs) ? body.faqs : [];
  if (faqs.length > 0) {
    await prisma.knowledge.createMany({
      data: faqs.map((faq, i) => ({
        tenantId: tenant.id,
        type: "faq",
        title: faq.q,
        content: faq.a,
        sortOrder: i,
      })),
    });
  }

  // Clerk publicMetadata: just the gate flag + tenantId (config lives in DB now)
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      onboardingComplete: true,
      tenantId: tenant.id,
    },
  });

  // Cookie gives the middleware an immediate signal — JWT won't reflect the
  // publicMetadata update until the next token refresh (~60s).
  const response = NextResponse.json({ success: true });
  response.cookies.set("vai_onboarding_complete", "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
  return response;
}
