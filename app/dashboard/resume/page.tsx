import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getResumes } from "@/features/resume/actions/get-resumes";
import { ResumeList } from "@/features/resume/components/resume-list";

export default async function ResumePage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/auth/signin");
    }

    const resumes = await getResumes();

    return <ResumeList resumes={resumes} />;
}
