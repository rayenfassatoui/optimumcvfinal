"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profile } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { ProfileData } from "../types";

export async function updateProfile(data: ProfileData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    await db
        .update(profile)
        .set({
            content: JSON.stringify(data),
            updatedAt: new Date(),
        })
        .where(eq(profile.userId, session.user.id));

    return { success: true };
}
