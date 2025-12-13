"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profile } from "@/lib/schema";
import { openai } from "@/lib/ai";
import { headers } from "next/headers";
import { parsePDF } from "@/lib/pdf-parser";
import { ProfileData } from "@/features/onboarding/types";

export async function createResumeFromCV(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    const file = formData.get("cv") as File | null;

    if (!file) {
        throw new Error("No CV file provided");
    }

    // Parse PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const { text: cvText } = await parsePDF(buffer);

    if (!cvText || cvText.trim().length === 0) {
        throw new Error("Could not extract text from PDF. The file may be image-based or corrupted.");
    }

    // AI Prompt to extract structured data
    const prompt = `
You are an expert resume parser. Extract the following information from the resume text below and return it as a JSON object matching this EXACT structure:
{
  "fullName": "string",
  "email": "string", 
  "phone": "string",
  "linkedinUrl": "string or empty",
  "summary": "string - professional summary or objective",
  "experience": [
    { 
      "title": "job title", 
      "company": "company name", 
      "startDate": "MM/YYYY or YYYY", 
      "endDate": "MM/YYYY or YYYY or Present", 
      "description": "job responsibilities and achievements" 
    }
  ],
  "education": [
    { 
      "degree": "degree name", 
      "school": "school/university name", 
      "startDate": "MM/YYYY or YYYY", 
      "endDate": "MM/YYYY or YYYY or empty if current" 
    }
  ],
  "skills": ["skill1", "skill2", ...],
  "projects": [
    { 
      "name": "project name", 
      "description": "project description", 
      "techStack": ["tech1", "tech2"] 
    }
  ]
}

Instructions:
- Extract all information accurately from the resume
- If a field is not found, use an empty string "" or empty array []
- For dates, use the format shown in the resume or normalize to MM/YYYY
- Include all work experiences, education entries, skills, and projects found
- Keep descriptions concise but complete

Resume Text:
${cvText}
`;

    const completion = await openai.chat.completions.create({
        model: "mistralai/devstral-2512:free",
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant that extracts structured data from resumes. Always return valid JSON.",
            },
            { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
        throw new Error("Failed to parse resume with AI");
    }

    // Validate and ensure proper structure
    let parsedData: ProfileData;
    try {
        parsedData = JSON.parse(content);
        
        // Ensure required fields exist
        parsedData = {
            fullName: parsedData.fullName || session.user.name || "",
            email: parsedData.email || session.user.email || "",
            phone: parsedData.phone || "",
            linkedinUrl: parsedData.linkedinUrl || "",
            summary: parsedData.summary || "",
            experience: Array.isArray(parsedData.experience) ? parsedData.experience : [],
            education: Array.isArray(parsedData.education) ? parsedData.education : [],
            skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
            projects: Array.isArray(parsedData.projects) ? parsedData.projects : [],
        };
    } catch (e) {
        throw new Error("Failed to parse AI response");
    }

    // Extract name for resume title
    const resumeName = parsedData.fullName 
        ? `${parsedData.fullName}'s Resume` 
        : `Imported Resume - ${new Date().toLocaleDateString()}`;

    // Save to DB
    const [newResume] = await db
        .insert(profile)
        .values({
            userId: session.user.id,
            name: resumeName,
            content: JSON.stringify(parsedData),
            originalCvUrl: file.name,
        })
        .returning();

    return { 
        id: newResume.id, 
        success: true 
    };
}
