"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profile } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function getProfile() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return null;
    }

    const userProfile = await db.query.profile.findFirst({
        where: eq(profile.userId, session.user.id),
    });

    return userProfile;
}
