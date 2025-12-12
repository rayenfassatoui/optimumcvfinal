"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profile } from "@/lib/schema";
import { openai } from "@/lib/ai";
import { headers } from "next/headers";
import { parsePDF } from "@/lib/pdf-parser";
import { ProfileData } from "../types";

export async function processOnboarding(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    const file = formData.get("cv") as File | null;
    const linkedinUrl = formData.get("linkedinUrl") as string;

    let cvText = "";

    if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const { text } = await parsePDF(buffer);
        cvText = text;
    }

    // AI Prompt to extract structured data
    const prompt = `
    You are an expert resume parser. Extract the following information from the resume text below and return it as a JSON object matching this structure:
    {
      "fullName": "string",
      "email": "string",
      "phone": "string",
      "summary": "string",
      "experience": [{ "title": "string", "company": "string", "startDate": "string", "endDate": "string", "description": "string" }],
      "education": [{ "degree": "string", "school": "string", "startDate": "string", "endDate": "string" }],
      "skills": ["string"],
      "projects": [{ "name": "string", "description": "string", "techStack": ["string"] }]
    }

    Resume Text:
    ${cvText}
  `;

    const completion = await openai.chat.completions.create({
        model: "mistralai/devstral-2512:free",
        messages: [
            {
                role: "system",
                content:
                    "You are a helpful assistant that extracts structured data from resumes.",
            },
            { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
        throw new Error("Failed to parse resume with AI");
    }

    // Save to DB
    await db.insert(profile).values({
        userId: session.user.id,
        content: content,
        originalCvUrl: file ? file.name : null,
        linkedinUrl: linkedinUrl || null,
    });

    return { success: true, redirectUrl: "/onboarding/review" };
}
