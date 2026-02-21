import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { ProfileData } from "@/features/onboarding/types";
import { openai } from "@/lib/ai";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { parsePDF } from "@/lib/pdf-parser";
import { pfeBook, pfeTopic, profile } from "@/lib/schema";

export const maxDuration = 120; // Allow up to 120 seconds for processing + matching

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const companyName = formData.get("companyName") as string;

    if (!file || !companyName) {
      return NextResponse.json(
        { error: "Missing file or company name" },
        { status: 400 },
      );
    }

    // Parse PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const { text } = await parsePDF(buffer);

    // AI extraction
    const prompt = `
      You are an expert at extracting internship topics from PFE Books (PDFs).
      Extract all internship topics from the text below.
      Also extract the general contact email for the company (e.g., jobs@company.com, pfe@company.com) if available.

      For each topic, provide:
      - title
      - description (summary of the topic)
      - referenceNumber (if available)
      - techStack (list of technologies mentioned)

      Return a JSON object with a "topics" array and "companyEmail" string.
      {
        "companyEmail": "string | null",
        "topics": [
          {
            "title": "string",
            "description": "string",
            "referenceNumber": "string",
            "techStack": ["string"]
          }
        ]
      }

      Text:
      ${text}
    `;

    const completion = await openai.chat.completions.create({
      model: "arcee-ai/trinity-large-preview:free",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that extracts PFE topics.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to parse topics");
    }

    interface ExtractedTopic {
      title: string;
      description: string;
      referenceNumber?: string;
      techStack?: string[];
    }

    let topics: ExtractedTopic[] = [];
    let companyEmail: string | null = null;
    try {
      const json = JSON.parse(content);
      topics = json.topics;
      companyEmail = json.companyEmail || null;
    } catch {
      throw new Error("Failed to parse AI response");
    }

    // Save Book
    const [book] = await db
      .insert(pfeBook)
      .values({
        userId: session.user.id,
        fileUrl: file.name,
        companyName: companyName,
        email: companyEmail,
      })
      .returning();

    // Save Topics
    let savedTopicIds: string[] = [];
    if (topics.length > 0) {
      const savedTopics = await db
        .insert(pfeTopic)
        .values(
          topics.map((t) => ({
            bookId: book.id,
            title: t.title,
            description: t.description,
            referenceNumber: t.referenceNumber,
            techStack: JSON.stringify(t.techStack || []),
          })),
        )
        .returning({ id: pfeTopic.id });
      savedTopicIds = savedTopics.map((t) => t.id);
    }

    // Match topics with user's existing resumes (non-blocking best effort)
    let matchResults: {
      topicId: string;
      matchScore: number;
      bestResumeId: string;
      matchReason: string;
    }[] = [];
    try {
      const resumes = await db.query.profile.findMany({
        where: eq(profile.userId, session.user.id),
      });

      if (resumes.length > 0 && savedTopicIds.length > 0) {
        const resumeSummaries = resumes.map((r) => {
          const data = JSON.parse(r.content) as ProfileData;
          return {
            resumeId: r.id,
            resumeName: r.name,
            skills: data.skills,
            experience: data.experience.map(
              (e) => `${e.title} at ${e.company}`,
            ),
            projects:
              data.projects?.map(
                (p) => `${p.name} (${p.techStack.join(", ")})`,
              ) || [],
          };
        });

        const savedFullTopics = await Promise.all(
          savedTopicIds.map((id) =>
            db.query.pfeTopic.findFirst({ where: eq(pfeTopic.id, id) }),
          ),
        );

        const topicSummaries = savedFullTopics.filter(Boolean).map((t) => ({
          topicId: t!.id,
          title: t!.title,
          description: t!.description,
          techStack: t!.techStack,
        }));

        const matchPrompt = `
          Compare each PFE topic against each resume and find the best match.
          
          Resumes: ${JSON.stringify(resumeSummaries)}
          Topics: ${JSON.stringify(topicSummaries)}

          For each topic return: topicId, bestResumeId, matchScore (0-100), matchReason.
          Return JSON: { "matches": [...] }
        `;

        const matchCompletion = await openai.chat.completions.create({
          model: "arcee-ai/trinity-large-preview:free",
          messages: [
            { role: "system", content: "You are a career matching expert." },
            { role: "user", content: matchPrompt },
          ],
          response_format: { type: "json_object" },
        });

        const matchContent = matchCompletion.choices[0].message.content;
        if (matchContent) {
          const parsed = JSON.parse(matchContent) as {
            matches: {
              topicId: string;
              bestResumeId: string;
              matchScore: number;
              matchReason: string;
            }[];
          };
          matchResults = parsed.matches;

          // Update topics with match data
          for (const match of matchResults) {
            await db
              .update(pfeTopic)
              .set({
                matchScore: match.matchScore,
                matchReason: match.matchReason,
                matchedResumeId: match.bestResumeId,
              })
              .where(eq(pfeTopic.id, match.topicId));
          }
        }
      }
    } catch (matchError) {
      // Matching is best-effort - don't fail the upload
      console.error("Matching error (non-fatal):", matchError);
    }

    return NextResponse.json({
      success: true,
      bookId: book.id,
      topicsCount: topics.length,
      matchResults,
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
