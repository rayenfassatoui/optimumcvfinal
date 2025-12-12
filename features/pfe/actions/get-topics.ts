"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pfeTopic, pfeBook } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";

export async function getTopics() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return [];
    }

    // Fetch all topics from books uploaded by the user
    // Actually, usually PFE books are public or shared, but here we scoped them to userId.
    // Let's fetch topics linked to books uploaded by the user.

    const books = await db.query.pfeBook.findMany({
        where: eq(pfeBook.userId, session.user.id),
        with: {
            topics: true,
        },
        orderBy: [desc(pfeBook.uploadedAt)],
    });

    return books.flatMap(b => b.topics.map(t => ({ ...t, companyName: b.companyName })));
}
