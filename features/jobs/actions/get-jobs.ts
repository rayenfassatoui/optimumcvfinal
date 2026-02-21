"use server";

import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { job } from "@/lib/schema";

export async function getJobs(status?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return [];
  }

  if (status) {
    return db.query.job.findMany({
      where: and(eq(job.userId, session.user.id), eq(job.status, status)),
      orderBy: [desc(job.createdAt)],
    });
  }

  return db.query.job.findMany({
    where: eq(job.userId, session.user.id),
    orderBy: [desc(job.createdAt)],
  });
}
