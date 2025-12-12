export interface PfeTopic {
    id: string;
    bookId: string;
    title: string;
    description: string;
    referenceNumber?: string;
    techStack?: string[];
    matchScore?: number;
    matchReason?: string;
}

export interface PfeBook {
    id: string;
    userId: string;
    fileUrl: string;
    companyName: string;
    uploadedAt: Date;
}

export interface Application {
    id: string;
    userId: string;
    topicId: string;
    status: "DRAFT" | "GENERATED" | "SENT";
    generatedCvUrl?: string;
    coverLetterContent?: string;
    emailBody?: string;
    createdAt: Date;
}
