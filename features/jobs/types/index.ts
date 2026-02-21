export interface Job {
  id: string;
  userId: string;
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  url: string;
  source: string;
  salary: string | null;
  jobType: string | null;
  techStack: string | null; // JSON stringified array
  matchScore: number | null;
  matchReason: string | null;
  matchedResumeId: string | null;
  status: "NEW" | "SAVED" | "APPLIED" | "REJECTED";
  appliedAt: Date | null;
  createdAt: Date;
}

export type JobStatus = "NEW" | "SAVED" | "APPLIED" | "REJECTED";

/** Shape returned by each job provider after normalization */
export interface NormalizedJob {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  source: string;
  salary: string | null;
  jobType: string | null;
  techStack: string[];
}

/** Contract every job provider must implement */
export interface JobProvider {
  name: string;
  search(
    keywords: string[],
    filters: { jobType?: string; location?: string },
  ): Promise<NormalizedJob[]>;
}
