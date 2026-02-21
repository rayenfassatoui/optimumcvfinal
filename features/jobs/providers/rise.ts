import type { JobProvider, NormalizedJob } from "../types";

const RISE_API_BASE = "https://api.joinrise.io/api/v1/jobs/public";

interface RiseJob {
  title: string;
  url: string;
  type: string;
  locationAddress: string;
  skills_suggest: string[];
  department: string;
  seniority: string;
  owner: {
    companyName: string;
  };
  descriptionBreakdown: {
    oneSentenceJobSummary: string;
    salaryRangeMinYearly: number | null;
    salaryRangeMaxYearly: number | null;
    employmentType: string;
    keywords: string[];
  } | null;
}

interface RiseResponse {
  success: boolean;
  result: {
    count: number;
    jobs: RiseJob[];
  };
}

function formatSalary(
  breakdown: RiseJob["descriptionBreakdown"],
): string | null {
  if (!breakdown) return null;
  const { salaryRangeMinYearly, salaryRangeMaxYearly } = breakdown;
  if (!salaryRangeMinYearly && !salaryRangeMaxYearly) return null;

  const fmt = (n: number) => `$${Math.round(n / 1000)}k`;

  if (salaryRangeMinYearly && salaryRangeMaxYearly) {
    return `${fmt(salaryRangeMinYearly)} - ${fmt(salaryRangeMaxYearly)}/year`;
  }
  if (salaryRangeMinYearly) return `From ${fmt(salaryRangeMinYearly)}/year`;
  return `Up to ${fmt(salaryRangeMaxYearly!)}/year`;
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

function normalizeRiseJob(riseJob: RiseJob): NormalizedJob {
  const breakdown = riseJob.descriptionBreakdown;

  const techStack = [
    ...new Set([...riseJob.skills_suggest, ...(breakdown?.keywords ?? [])]),
  ].filter(Boolean);

  return {
    title: riseJob.title,
    company: riseJob.owner.companyName,
    location: riseJob.locationAddress || "Not specified",
    description:
      breakdown?.oneSentenceJobSummary ||
      `${riseJob.title} position at ${riseJob.owner.companyName}`,
    url: riseJob.url,
    source: "rise",
    salary: formatSalary(breakdown),
    jobType: normalizeJobType(riseJob.type || breakdown?.employmentType || ""),
    techStack,
  };
}

export const riseProvider: JobProvider = {
  name: "rise",

  async search(keywords, filters) {
    try {
      // Use only the first 1-2 keywords — too many terms returns 0 results
      const searchQuery = keywords.slice(0, 2).join(" ");
      const params = new URLSearchParams({
        page: "1",
        limit: "20",
        sort: "des",
        search: searchQuery,
      });

      if (filters.jobType) {
        params.set("type", filters.jobType);
      }

      const response = await fetch(`${RISE_API_BASE}?${params.toString()}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        console.error(`[Rise] API returned ${response.status}`);
        return [];
      }

      const data = (await response.json()) as RiseResponse;

      if (!data.success || !data.result?.jobs) {
        return [];
      }

      let jobs = data.result.jobs.map(normalizeRiseJob);

      // Apply location filter client-side if provided
      if (filters.location) {
        const loc = filters.location.toLowerCase();
        jobs = jobs.filter(
          (j) =>
            j.location.toLowerCase().includes(loc) ||
            (loc === "remote" && j.location.toLowerCase().includes("remote")),
        );
      }

      return jobs;
    } catch (error) {
      console.error("[Rise] Failed to fetch jobs:", error);
      return [];
    }
  },
};
