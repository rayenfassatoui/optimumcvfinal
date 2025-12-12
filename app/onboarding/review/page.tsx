import { redirect } from "next/navigation";
import { getProfile } from "@/features/onboarding/actions/get-profile";
import { ProfileReviewForm } from "@/features/onboarding/components/profile-review-form";
import { ProfileData } from "@/features/onboarding/types";

export default async function ReviewProfilePage() {
    const userProfile = await getProfile();

    if (!userProfile) {
        redirect("/onboarding");
    }

    let profileData: ProfileData;
    try {
        profileData = JSON.parse(userProfile.content);
    } catch (e) {
        // Fallback if content is not valid JSON or empty
        profileData = {
            fullName: "",
            email: "",
            experience: [],
            education: [],
            skills: [],
        };
    }

    return <ProfileReviewForm initialData={profileData} />;
}
