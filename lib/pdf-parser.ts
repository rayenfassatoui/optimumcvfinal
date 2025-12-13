import { extractText, getDocumentProxy } from "unpdf";

export interface PDFParseResult {
    text: string;
    numPages: number;
}

/**
 * Parse PDF file and extract text content
 * Uses unpdf - designed for Node.js/serverless environments
 * @param file - The PDF file as a Buffer or Uint8Array
 * @returns Extracted text and metadata
 */
export async function parsePDF(file: Buffer | Uint8Array): Promise<PDFParseResult> {
    try {
        const pdf = await getDocumentProxy(new Uint8Array(file));
        const { text, totalPages } = await extractText(pdf, { mergePages: true });

        return {
            text: Array.isArray(text) ? text.join("\n\n") : text,
            numPages: totalPages,
        };
    } catch (error: any) {
        console.error("PDF parsing error:", error);
        throw new Error(
            `Failed to parse PDF: ${error.message || "The file may be corrupted or encrypted."}`
        );
    }
}
