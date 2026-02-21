"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profile } from "@/lib/schema";
import type { ProfileData } from "../types";

export async function updateProfile(data: ProfileData, profileId?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (profileId) {
    // Update specific profile by ID (with ownership check)
    const existing = await db.query.profile.findFirst({
      where: and(
        eq(profile.id, profileId),
        eq(profile.userId, session.user.id),
      ),
    });

    if (!existing) {
      throw new Error("Profile not found");
    }

    await db
      .update(profile)
      .set({
        content: JSON.stringify(data),
        updatedAt: new Date(),
      })
      .where(eq(profile.id, profileId));
  } else {
    // Legacy: update first profile for user (onboarding flow)
    const existing = await db.query.profile.findFirst({
      where: eq(profile.userId, session.user.id),
    });

    if (!existing) {
      throw new Error("Profile not found");
    }

    await db
      .update(profile)
      .set({
        content: JSON.stringify(data),
        updatedAt: new Date(),
      })
      .where(eq(profile.id, existing.id));
  }

  return { success: true };
}
