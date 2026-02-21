export interface PfeTopic {
  id: string;
  bookId: string;
  title: string;
  description: string;
  referenceNumber?: string | null;
  techStack?: string | null; // JSON stringified array in DB
  matchScore?: number | null;
  matchReason?: string | null;
  matchedResumeId?: string | null;
}

export interface PfeBook {
  id: string;
  userId: string;
  fileUrl: string;
  companyName: string;
  email?: string | null;
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

export interface Job {
  id: string;
  userId: string;
  title: string;
  company: string;
  location?: string | null;
  description?: string | null;
  url: string;
  source: string;
  salary?: string | null;
  jobType?: string | null;
  techStack?: string | null; // JSON stringified array
  matchScore?: number | null;
  matchReason?: string | null;
  matchedResumeId?: string | null;
  status: "NEW" | "SAVED" | "APPLIED" | "REJECTED";
  appliedAt?: Date | null;
  createdAt: Date;
}
