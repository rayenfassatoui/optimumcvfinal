import { redirect } from "next/navigation";
import { getProfile } from "@/features/onboarding/actions/get-profile";
import { ResumeEditorPage } from "@/features/resume/components/resume-editor-page";
import { ProfileData } from "@/features/onboarding/types";

export default async function ResumePage() {
    const userProfile = await getProfile();

    if (!userProfile) {
        redirect("/onboarding");
    }

    let profileData: ProfileData;
    try {
        profileData = JSON.parse(userProfile.content);
    } catch (e) {
        profileData = {
            fullName: "",
            email: "",
            experience: [],
            education: [],
            skills: [],
        };
    }

    return <ResumeEditorPage initialData={profileData} />;
}
