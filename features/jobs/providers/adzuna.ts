import type { JobProvider, NormalizedJob } from "../types";

const ADZUNA_API_BASE = "https://api.adzuna.com/v1/api/jobs";

interface AdzunaJob {
  id: string;
  title: string;
  description: string;
  created: string;
  redirect_url: string;
  company: { display_name: string } | null;
  location: { display_name: string; area: string[] } | null;
  salary_min: number | null;
  salary_max: number | null;
  contract_time: string | null;
  contract_type: string | null;
  category: { label: string; tag: string } | null;
}

interface AdzunaResponse {
  results: AdzunaJob[];
  count: number;
}

function formatSalary(job: AdzunaJob): string | null {
  const min = job.salary_min;
  const max = job.salary_max;
  if (min == null && max == null) return null;

  const fmt = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

  if (min != null && max != null) {
    return `${fmt(min)} - ${fmt(max)}/year`;
  }
  if (min != null) return `From ${fmt(min)}/year`;
  return `Up to ${fmt(max!)}/year`;
}

function normalizeContractType(
  contractType: string | null,
  contractTime: string | null,
): string | null {
  const combined = [contractType, contractTime]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (combined.includes("full")) return "full-time";
  if (combined.includes("part")) return "part-time";
  if (combined.includes("contract")) return "contract";
  if (combined.includes("intern")) return "internship";
  if (combined.includes("permanent")) return "full-time";
  return contractTime || contractType || null;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

function normalizeAdzunaJob(adzJob: AdzunaJob): NormalizedJob {
  const categoryTags: string[] = [];
  if (adzJob.category?.label) {
    categoryTags.push(adzJob.category.label);
  }

  return {
    title: adzJob.title,
    company: adzJob.company?.display_name || "Unknown Company",
    location: adzJob.location?.display_name || "Not specified",
    description: truncate(
      adzJob.description || `${adzJob.title} position`,
      500,
    ),
    url: adzJob.redirect_url,
    source: "adzuna",
    salary: formatSalary(adzJob),
    jobType: normalizeContractType(adzJob.contract_type, adzJob.contract_time),
    techStack: categoryTags,
  };
}

/**
 * Adzuna job provider — aggregates jobs from many sources.
 * Requires ADZUNA_APP_ID and ADZUNA_API_KEY env vars.
 * Free tier: 5,000 requests/month.
 * Get keys at: https://developer.adzuna.com/
 */
export const adzunaProvider: JobProvider = {
  name: "adzuna",

  async search(keywords, filters) {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_API_KEY;

    // Skip silently if credentials not configured
    if (!appId || !appKey) {
      return [];
    }

    try {
      // Use only the first 1-2 keywords — too many terms returns 0 results
      const searchQuery = keywords.slice(0, 2).join(" ");
      // Default to "us" — can be extended to support multiple countries
      const country = "us";
      const page = 1;

      const url = new URL(`${ADZUNA_API_BASE}/${country}/search/${page}`);
      url.searchParams.set("app_id", appId);
      url.searchParams.set("app_key", appKey);
      url.searchParams.set("what", searchQuery);
      url.searchParams.set("results_per_page", "20");
      url.searchParams.set("sort_by", "date");
      url.searchParams.set("max_days_old", "30");
      url.searchParams.set("content-type", "application/json");

      if (filters.location) {
        url.searchParams.set("where", filters.location);
      }

      if (filters.jobType) {
        const jt = filters.jobType.toLowerCase();
        if (jt.includes("full")) {
          url.searchParams.set("full_time", "1");
        } else if (jt.includes("part")) {
          url.searchParams.set("part_time", "1");
        } else if (jt.includes("contract")) {
          url.searchParams.set("contract", "1");
        } else if (jt.includes("permanent")) {
          url.searchParams.set("permanent", "1");
        }
      }

      const response = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        console.error(`[Adzuna] API returned ${response.status}`);
        return [];
      }

      const data = (await response.json()) as AdzunaResponse;

      if (!data.results) {
        return [];
      }

      // Only include jobs that have a valid redirect URL
      return data.results.filter((j) => j.redirect_url).map(normalizeAdzunaJob);
    } catch (error) {
      console.error("[Adzuna] Failed to fetch jobs:", error);
      return [];
    }
  },
};
