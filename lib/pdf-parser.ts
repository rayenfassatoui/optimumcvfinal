export interface PDFParseResult {
    text: string;
    numPages: number;
}

/**
 * Parse PDF file and extract text content
 * Server-side only - uses pdf-parse library
 * @param file - The PDF file as a Buffer
 * @returns Extracted text and metadata
 */
export async function parsePDF(file: Buffer): Promise<PDFParseResult> {
    try {
        // Use dynamic require for CommonJS module
        const pdfParse = require("pdf-parse");
        const data = await pdfParse(file);

        return {
            text: data.text,
            numPages: data.numpages,
        };
    } catch (error: any) {
        console.error("PDF parsing error:", error);
        throw new Error(
            `Failed to parse PDF: ${error.message || "The file may be corrupted or encrypted."}`
        );
    }
}
