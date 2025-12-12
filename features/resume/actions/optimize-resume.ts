"use server";

import { auth } from "@/lib/auth";
import { openai } from "@/lib/ai";
import { headers } from "next/headers";
import { ProfileData } from "@/features/onboarding/types";

export async function optimizeResume(currentData: ProfileData, instruction: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    const prompt = `
    You are an expert resume writer and ATS optimizer.
    
    Current Resume Data (JSON):
    ${JSON.stringify(currentData, null, 2)}

    Instruction:
    ${instruction}

    Please update the resume data based on the instruction.
    - If the instruction is "Optimize for ATS", ensure keywords are present, action verbs are strong, and descriptions are quantifiable.
    - Maintain the same JSON structure.
    - Return ONLY the JSON object.
  `;

    const completion = await openai.chat.completions.create({
        model: "mistralai/devstral-2512:free",
        messages: [
            { role: "system", content: "You are a helpful assistant that improves resumes." },
            { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
        throw new Error("Failed to optimize resume");
    }

    try {
        const optimizedData = JSON.parse(content) as ProfileData;
        return optimizedData;
    } catch (e) {
        throw new Error("Failed to parse optimized resume");
    }
}
