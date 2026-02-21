"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { ProfileData } from "@/features/onboarding/types";
import { openai } from "@/lib/ai";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { job, profile } from "@/lib/schema";
import { adzunaProvider } from "../providers/adzuna";
import { remotiveProvider } from "../providers/remotive";
import { riseProvider } from "../providers/rise";
import type { NormalizedJob } from "../types";

interface SearchJobsInput {
  resumeId: string;
  jobType?: string;
  locationPreference?: string;
}

interface ScoredJob {
  matchScore: number;
  matchReason: string;
}

/**
 * Extract search keywords from the user's resume profile.
 * Returns a short, focused list of keywords for API search.
 * APIs work best with 2-3 keywords, not a long list.
 */
function extractKeywords(profileData: ProfileData): string[] {
  const keywords: string[] = [];

  // Prefer recent job titles first (most search-relevant)
  if (profileData.experience.length > 0) {
    const titles = profileData.experience
      .slice(0, 2)
      .map((exp) => exp.title)
      .filter(Boolean);
    keywords.push(...titles);
  }

  // Add top skills (up to 3, only if we need more keywords)
  if (profileData.skills.length > 0) {
    const remainingSlots = Math.max(0, 4 - keywords.length);
    keywords.push(...profileData.skills.slice(0, remainingSlots));
  }

  // Fallback: use education if no skills or experience
  if (keywords.length === 0 && profileData.education.length > 0) {
    keywords.push(
      ...profileData.education.slice(0, 2).map((edu) => edu.degree),
    );
  }

  // Deduplicate and remove empties
  return [...new Set(keywords.filter(Boolean))];
}

/**
 * Deduplicate jobs by title + company (case-insensitive).
 */
function deduplicateJobs(jobs: NormalizedJob[]): NormalizedJob[] {
  const seen = new Set<string>();
  return jobs.filter((j) => {
    const key = `${j.title.toLowerCase()}|${j.company.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Use AI to score how well each job matches the candidate's profile.
 * Returns a map from index to {matchScore, matchReason}.
 * Falls back gracefully — returns empty map on failure.
 */
async function scoreJobsWithAI(
  jobs: NormalizedJob[],
  profileData: ProfileData,
): Promise<Map<number, ScoredJob>> {
  const scores = new Map<number, ScoredJob>();

  if (jobs.length === 0) return scores;

  const jobSummaries = jobs.map((j, i) => ({
    index: i,
    title: j.title,
    company: j.company,
    techStack: j.techStack.join(", "),
    jobType: j.jobType,
  }));

  const prompt = `You are a job matching engine. Score how well each job matches this candidate.

Candidate Profile:
- Skills: ${profileData.skills.join(", ")}
- Experience: ${profileData.experience.map((e) => `${e.title} at ${e.company}`).join("; ")}
- Education: ${profileData.education.map((e) => `${e.degree} from ${e.school}`).join("; ")}
- Summary: ${profileData.summary || "N/A"}

Jobs to score:
${JSON.stringify(jobSummaries)}

For each job, return a matchScore (0-100, be realistic) and a brief matchReason (1 sentence).
Return JSON: { "scores": [{ "index": 0, "matchScore": 75, "matchReason": "..." }, ...] }`;

  try {
    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-4-maverick:free",
      messages: [
        {
          role: "system",
          content:
            "You are a job matching engine that scores job-candidate fit. Return only valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) return scores;

    const parsed = JSON.parse(content) as {
      scores: Array<{ index: number; matchScore: number; matchReason: string }>;
    };

    for (const score of parsed.scores) {
      if (
        typeof score.index === "number" &&
        typeof score.matchScore === "number" &&
        score.index >= 0 &&
        score.index < jobs.length
      ) {
        scores.set(score.index, {
          matchScore: Math.min(100, Math.max(0, Math.round(score.matchScore))),
          matchReason: score.matchReason || "Match scored by AI",
        });
      }
    }
  } catch (error) {
    console.error("[AI Scoring] Failed to score jobs:", error);
    // Graceful degradation: jobs still returned without scores
  }

  return scores;
}

export async function searchJobs(input: SearchJobsInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Fetch the selected resume
  const resume = await db.query.profile.findFirst({
    where: eq(profile.id, input.resumeId),
  });

  if (!resume || resume.userId !== session.user.id) {
    throw new Error("Resume not found");
  }

  const profileData = JSON.parse(resume.content) as ProfileData;
  const keywords = extractKeywords(profileData);

  if (keywords.length === 0) {
    throw new Error(
      "Could not extract search keywords from your resume. Please ensure your resume has skills or experience listed.",
    );
  }

  const filters = {
    jobType: input.jobType,
    location: input.locationPreference,
  };

  // Fetch real jobs from all providers in parallel
  // Each provider gets the same keywords — providers internally use the top 1-2
  const [riseJobs, remotiveJobs, adzunaJobs] = await Promise.all([
    riseProvider.search(keywords, filters),
    remotiveProvider.search(keywords, filters),
    adzunaProvider.search(keywords, filters),
  ]);

  console.log(
    `[Job Search] Keywords: ${keywords.join(", ")} | Rise: ${riseJobs.length} | Remotive: ${remotiveJobs.length} | Adzuna: ${adzunaJobs.length}`,
  );

  // Merge and deduplicate
  const allJobs = deduplicateJobs([
    ...riseJobs,
    ...remotiveJobs,
    ...adzunaJobs,
  ]);

  if (allJobs.length === 0) {
    return [];
  }

  // Score jobs with AI (graceful — if AI fails, jobs still returned)
  const scores = await scoreJobsWithAI(allJobs, profileData);

  // Save all jobs to the database
  const savedJobs = await db
    .insert(job)
    .values(
      allJobs.map((j, i) => {
        const score = scores.get(i);
        return {
          userId: session.user.id,
          title: j.title,
          company: j.company,
          location: j.location,
          description: j.description,
          url: j.url,
          source: j.source,
          salary: j.salary,
          jobType: j.jobType,
          techStack: JSON.stringify(j.techStack),
          matchScore: score?.matchScore ?? null,
          matchReason: score?.matchReason ?? null,
          matchedResumeId: input.resumeId,
          status: "NEW",
        };
      }),
    )
    .returning();

  return savedJobs;
}
