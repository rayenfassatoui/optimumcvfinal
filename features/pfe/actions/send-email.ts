"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { account } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function sendEmail({
    to,
    subject,
    body,
    attachments = [],
}: {
    to: string;
    subject: string;
    body: string;
    attachments?: { filename: string; content: string; contentType: string }[];
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    // Get Google Account
    const googleAccount = await db.query.account.findFirst({
        where: and(
            eq(account.userId, session.user.id),
            eq(account.providerId, "google")
        ),
    });

    if (!googleAccount || !googleAccount.accessToken) {
        throw new Error("Google account not linked or missing access token");
    }

    const boundary = "foo_bar_baz";
    const messageParts = [
        `To: ${to}`,
        `Subject: ${subject}`,
        "MIME-Version: 1.0",
        `Content-Type: multipart/mixed; boundary="${boundary}"`,
        "",
        `--${boundary}`,
        "Content-Type: text/plain; charset=utf-8",
        "MIME-Version: 1.0",
        "",
        body,
    ];

    if (attachments && attachments.length > 0) {
        for (const attachment of attachments) {
            messageParts.push(`--${boundary}`);
            messageParts.push(`Content-Type: ${attachment.contentType}; name="${attachment.filename}"`);
            messageParts.push(`Content-Disposition: attachment; filename="${attachment.filename}"`);
            messageParts.push("Content-Transfer-Encoding: base64");
            messageParts.push("");
            messageParts.push(attachment.content);
        }
    }

    messageParts.push(`--${boundary}--`);

    const message = messageParts.join("\n");

    const encodedMessage = Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    const res = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${googleAccount.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                raw: encodedMessage,
            }),
        }
    );

    if (!res.ok) {
        const error = await res.json();
        console.error("Gmail API Error:", error);
        throw new Error(`Failed to send email: ${error.error.message}`);
    }

    return { success: true };
}
