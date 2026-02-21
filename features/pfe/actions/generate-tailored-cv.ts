"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { ProfileData } from "@/features/onboarding/types";
import { openai } from "@/lib/ai";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pfeTopic, profile } from "@/lib/schema";

/**
 * Auto-generate a CV tailored to a specific PFE topic.
 * Takes the user's best existing resume as a base and optimizes it for the topic.
 */
export async function generateTailoredCv(
  topicId: string,
  baseResumeId: string,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Fetch base resume
  const baseResume = await db.query.profile.findFirst({
    where: eq(profile.id, baseResumeId),
  });

  if (!baseResume || baseResume.userId !== session.user.id) {
    throw new Error("Base resume not found");
  }

  // Fetch topic
  const topic = await db.query.pfeTopic.findFirst({
    where: eq(pfeTopic.id, topicId),
    with: { book: true },
  });

  if (!topic) {
    throw new Error("Topic not found");
  }

  const baseData = JSON.parse(baseResume.content) as ProfileData;

  const prompt = `
    You are an expert resume writer. Create a tailored resume for this specific PFE internship topic.
    
    Base Resume Data:
    ${JSON.stringify(baseData, null, 2)}

    Target Internship:
    Title: ${topic.title}
    Company: ${topic.book.companyName}
    Description: ${topic.description}
    Tech Stack: ${topic.techStack}

    Create an optimized version of the resume that:
    1. Highlights relevant skills and experience for this specific topic
    2. Reorders/rephrases experience bullets to emphasize relevance
    3. Adds relevant skills from the tech stack if the candidate likely has them
    4. Adjusts the summary to target this specific role
    5. Does NOT fabricate experience - only reorganize and rephrase existing data

    Return the resume as JSON matching this exact structure:
    {
      "fullName": "string",
      "email": "string",
      "phone": "string",
      "linkedinUrl": "string",
      "summary": "string",
      "experience": [{ "title": "string", "company": "string", "startDate": "string", "endDate": "string", "description": "string" }],
      "education": [{ "degree": "string", "school": "string", "startDate": "string", "endDate": "string" }],
      "skills": ["string"],
      "projects": [{ "name": "string", "description": "string", "techStack": ["string"] }]
    }
  `;

  const completion = await openai.chat.completions.create({
    model: "arcee-ai/trinity-large-preview:free",
    messages: [
      {
        role: "system",
        content:
          "You are an expert resume writer that returns structured JSON.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error("Failed to generate tailored CV");
  }

  let tailoredData: ProfileData;
  try {
    tailoredData = JSON.parse(content) as ProfileData;
  } catch {
    throw new Error("Failed to parse AI response");
  }

  // Save as a new resume
  const resumeName = `CV for ${topic.title} - ${topic.book.companyName}`;
  const [newResume] = await db
    .insert(profile)
    .values({
      userId: session.user.id,
      name: resumeName,
      content: JSON.stringify(tailoredData),
    })
    .returning();

  // Update the topic's matched resume
  await db
    .update(pfeTopic)
    .set({
      matchedResumeId: newResume.id,
      matchScore: 90, // Tailored CV should be a good match
      matchReason: "Auto-generated CV tailored specifically for this topic",
    })
    .where(eq(pfeTopic.id, topicId));

  return newResume;
}
