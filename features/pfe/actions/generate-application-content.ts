"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profile, pfeTopic, pfeBook } from "@/lib/schema";
import { openai } from "@/lib/ai";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { ProfileData } from "@/features/onboarding/types";

export async function generateApplicationContent(topicId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    // Fetch Profile
    const userProfile = await db.query.profile.findFirst({
        where: eq(profile.userId, session.user.id),
    });

    if (!userProfile) {
        throw new Error("Profile not found");
    }

    const profileData = JSON.parse(userProfile.content) as ProfileData;

    // Fetch Topic
    const topic = await db.query.pfeTopic.findFirst({
        where: eq(pfeTopic.id, topicId),
        with: {
            book: true,
        },
    });

    if (!topic) {
        throw new Error("Topic not found");
    }

    // AI Prompt
    const prompt = `
    You are an expert career coach and application assistant.
    
    Candidate Profile:
    ${JSON.stringify(profileData, null, 2)}

    Internship Topic:
    Title: ${topic.title}
    Company: ${topic.book.companyName}
    Description: ${topic.description}
    Tech Stack: ${topic.techStack}

    Generate the following application materials tailored to this specific topic:
    1. Tailored Resume Data (JSON structure matching the candidate profile but optimized for this topic).
    2. Cover Letter (Markdown).
    3. Email Body (Plain text).

    Return a JSON object:
    {
      "tailoredResume": { ... },
      "coverLetter": "string",
      "emailBody": "string",
      "emailSubject": "string"
    }
  `;

    const completion = await openai.chat.completions.create({
        model: "mistralai/devstral-2512:free",
        messages: [
            { role: "system", content: "You are a helpful assistant that generates job application materials." },
            { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
        throw new Error("Failed to generate application content");
    }

    try {
        return JSON.parse(content);
    } catch (e) {
        throw new Error("Failed to parse AI response");
    }
}
