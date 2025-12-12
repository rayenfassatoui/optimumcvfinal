import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pfeBook, pfeTopic } from "@/lib/schema";
import { openai } from "@/lib/ai";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { parsePDF } from "@/lib/pdf-parser";

export const maxDuration = 60; // Allow up to 60 seconds for processing

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
                { status: 400 }
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
      For each topic, provide:
      - title
      - description (summary of the topic)
      - referenceNumber (if available)
      - techStack (list of technologies mentioned)

      Return a JSON object with a "topics" array.
      {
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
            model: "mistralai/devstral-2512:free",
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

        let topics: any[] = [];
        try {
            const json = JSON.parse(content);
            topics = json.topics;
        } catch (e) {
            throw new Error("Failed to parse AI response");
        }

        // Save Book
        const [book] = await db
            .insert(pfeBook)
            .values({
                userId: session.user.id,
                fileUrl: file.name,
                companyName: companyName,
            })
            .returning();

        // Save Topics
        if (topics.length > 0) {
            await db.insert(pfeTopic).values(
                topics.map((t) => ({
                    bookId: book.id,
                    title: t.title,
                    description: t.description,
                    referenceNumber: t.referenceNumber,
                    techStack: JSON.stringify(t.techStack || []),
                }))
            );
        }

        return NextResponse.json({ success: true, bookId: book.id, topicsCount: topics.length });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
