import type { JobProvider, NormalizedJob } from "../types";

const REMOTIVE_API_BASE = "https://remotive.com/api/remote-jobs";

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  company_logo: string | null;
  category: string;
  tags: string[];
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary: string;
  description: string;
}

interface RemotiveResponse {
  "job-count": number;
  jobs: RemotiveJob[];
}

const HTML_TAG_REGEX = /<[^>]*>/g;
const WHITESPACE_REGEX = /\s{2,}/g;

function stripHtml(html: string): string {
  return html
    .replace(HTML_TAG_REGEX, " ")
    .replace(WHITESPACE_REGEX, " ")
    .trim();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

function normalizeJobType(raw: string): string | null {
  const lower = raw.toLowerCase();
  if (lower.includes("full")) return "full-time";
  if (lower.includes("part")) return "part-time";
  if (lower.includes("contract") || lower.includes("freelance"))
    return "contract";
  if (lower.includes("intern")) return "internship";
  return raw || null;
}

function normalizeRemotiveJob(remJob: RemotiveJob): NormalizedJob {
  const rawDescription = stripHtml(remJob.description);

  return {
    title: remJob.title,
    company: remJob.company_name,
    location: remJob.candidate_required_location || "Remote",
    description: truncate(rawDescription, 500),
    url: remJob.url,
    source: "remotive",
    salary: remJob.salary || null,
    jobType: normalizeJobType(remJob.job_type),
    techStack: remJob.tags.filter(Boolean),
  };
}

export const remotiveProvider: JobProvider = {
  name: "remotive",

  async search(keywords, filters) {
    try {
      // Use only the first 1-2 keywords — too many terms returns 0 results
      const searchQuery = keywords.slice(0, 2).join(" ");
      const params = new URLSearchParams({
        search: searchQuery,
        limit: "20",
      });

      const response = await fetch(
        `${REMOTIVE_API_BASE}?${params.toString()}`,
        {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(15_000),
        },
      );

      if (!response.ok) {
        console.error(`[Remotive] API returned ${response.status}`);
        return [];
      }

      const data = (await response.json()) as RemotiveResponse;

      if (!data.jobs) {
        return [];
      }

      let jobs = data.jobs.map(normalizeRemotiveJob);

      // Apply location filter if provided
      if (filters.location) {
        const loc = filters.location.toLowerCase();
        jobs = jobs.filter(
          (j) =>
            j.location.toLowerCase().includes(loc) ||
            j.location.toLowerCase().includes("worldwide"),
        );
      }

      // Apply jobType filter if provided
      if (filters.jobType) {
        const ft = filters.jobType.toLowerCase();
        jobs = jobs.filter((j) => j.jobType?.toLowerCase().includes(ft));
      }

      return jobs;
    } catch (error) {
      console.error("[Remotive] Failed to fetch jobs:", error);
      return [];
    }
  },
};
