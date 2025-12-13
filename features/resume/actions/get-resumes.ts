"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profile } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";

export async function getResumes() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return [];
    }

    const resumes = await db.query.profile.findMany({
        where: eq(profile.userId, session.user.id),
        orderBy: [desc(profile.updatedAt)],
    });

    return resumes;
}
