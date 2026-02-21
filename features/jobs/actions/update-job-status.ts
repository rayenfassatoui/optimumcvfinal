"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { job } from "@/lib/schema";
import type { JobStatus } from "../types";

export async function updateJobStatus(jobId: string, status: JobStatus) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const existingJob = await db.query.job.findFirst({
    where: and(eq(job.id, jobId), eq(job.userId, session.user.id)),
  });

  if (!existingJob) {
    throw new Error("Job not found");
  }

  await db
    .update(job)
    .set({
      status,
      ...(status === "APPLIED" ? { appliedAt: new Date() } : {}),
    })
    .where(eq(job.id, jobId));

  return { success: true };
}
