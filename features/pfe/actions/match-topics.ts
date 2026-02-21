"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { ProfileData } from "@/features/onboarding/types";
import { openai } from "@/lib/ai";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pfeTopic, profile } from "@/lib/schema";

/**
 * Match PFE topics against all user resumes.
 * For each topic, find the best matching resume and score.
 * If no resume scores above threshold, flag it for CV generation.
 */
export async function matchTopicsWithResumes(topicIds: string[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Fetch all user resumes
  const resumes = await db.query.profile.findMany({
    where: eq(profile.userId, session.user.id),
  });

  if (resumes.length === 0) {
    return { matched: false, reason: "No resumes found" };
  }

  // Fetch the topics
  const topics = await Promise.all(
    topicIds.map(async (id) => {
      return db.query.pfeTopic.findFirst({
        where: eq(pfeTopic.id, id),
      });
    }),
  );

  const validTopics = topics.filter(Boolean);
  if (validTopics.length === 0) {
    return { matched: false, reason: "No valid topics found" };
  }

  // Build resume summaries for the AI
  const resumeSummaries = resumes.map((r) => {
    const data = JSON.parse(r.content) as ProfileData;
    return {
      resumeId: r.id,
      resumeName: r.name,
      skills: data.skills,
      experience: data.experience.map((e) => `${e.title} at ${e.company}`),
      education: data.education.map((e) => `${e.degree} from ${e.school}`),
      projects:
        data.projects?.map((p) => `${p.name} (${p.techStack.join(", ")})`) ||
        [],
      summary: data.summary || "",
    };
  });

  const topicSummaries = validTopics.map((t) => ({
    topicId: t!.id,
    title: t!.title,
    description: t!.description,
    techStack: t!.techStack,
  }));

  const prompt = `
    You are an expert career matcher. Compare each PFE topic against each resume and find the best match.
    
    Resumes:
    ${JSON.stringify(resumeSummaries, null, 2)}

    PFE Topics:
    ${JSON.stringify(topicSummaries, null, 2)}

    For each topic, return:
    - topicId: the topic's ID
    - bestResumeId: the resume ID that matches best
    - matchScore: 0-100 (be realistic - consider skill overlap, relevant experience, education fit)
    - matchReason: Brief explanation of why this score

    Return JSON: { "matches": [...] }
  `;

  const completion = await openai.chat.completions.create({
    model: "arcee-ai/trinity-large-preview:free",
    messages: [
      {
        role: "system",
        content:
          "You are a career matching expert that evaluates resume-topic fit.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error("Failed to get matching results");
  }

  interface MatchResult {
    topicId: string;
    bestResumeId: string;
    matchScore: number;
    matchReason: string;
  }

  let matches: MatchResult[];
  try {
    const parsed = JSON.parse(content) as { matches: MatchResult[] };
    matches = parsed.matches;
  } catch {
    throw new Error("Failed to parse matching results");
  }

  // Update each topic with its match data
  for (const match of matches) {
    await db
      .update(pfeTopic)
      .set({
        matchScore: match.matchScore,
        matchReason: match.matchReason,
        matchedResumeId: match.bestResumeId,
      })
      .where(eq(pfeTopic.id, match.topicId));
  }

  return {
    matched: true,
    matches,
  };
}
