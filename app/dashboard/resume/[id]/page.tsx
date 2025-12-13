import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getResumeById } from "@/features/resume/actions/resume-crud";
import { ResumeEditorPage } from "@/features/resume/components/resume-editor-page";
import { ProfileData } from "@/features/onboarding/types";

interface EditResumePageProps {
    params: Promise<{ id: string }>;
}

export default async function EditResumePage({ params }: EditResumePageProps) {
    const { id } = await params;

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/auth/signin");
    }

    let resume;
    try {
        resume = await getResumeById(id);
    } catch (error) {
        notFound();
    }

    let profileData: ProfileData;
    try {
        profileData = JSON.parse(resume.content);
    } catch (e) {
        profileData = {
            fullName: "",
            email: "",
            phone: "",
            linkedinUrl: "",
            summary: "",
            experience: [],
            education: [],
            skills: [],
            projects: [],
        };
    }

    return (
        <ResumeEditorPage
            resumeId={resume.id}
            resumeName={resume.name}
            initialData={profileData}
        />
    );
}
