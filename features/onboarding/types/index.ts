export interface ProfileData {
    fullName: string;
    email: string;
    phone?: string;
    linkedinUrl?: string;
    summary?: string;
    experience: {
        title: string;
        company: string;
        startDate: string;
        endDate?: string;
        description: string;
    }[];
    education: {
        degree: string;
        school: string;
        startDate: string;
        endDate?: string;
    }[];
    skills: string[];
    projects?: {
        name: string;
        description: string;
        techStack: string[];
    }[];
}
