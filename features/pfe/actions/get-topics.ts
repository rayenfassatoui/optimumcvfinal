"use server";

import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pfeBook } from "@/lib/schema";

export async function getTopics() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return [];
  }

  const books = await db.query.pfeBook.findMany({
    where: eq(pfeBook.userId, session.user.id),
    with: {
      topics: true,
    },
    orderBy: [desc(pfeBook.uploadedAt)],
  });

  return books.flatMap((b) =>
    b.topics.map((t) => ({
      ...t,
      companyName: b.companyName,
    })),
  );
}
