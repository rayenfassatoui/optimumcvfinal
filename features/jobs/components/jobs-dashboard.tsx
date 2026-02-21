"use client";

import { Briefcase, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getJobs } from "../actions/get-jobs";
import { searchJobs } from "../actions/search-jobs";
import { updateJobStatus } from "../actions/update-job-status";
import type { Job, JobStatus } from "../types";
import { JobCard } from "./job-card";
import { JobSearchForm } from "./job-search-form";

export function JobsDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("search");

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const data = await getJobs();
      setJobs(data as Job[]);
    } catch {
      toast.error("Failed to fetch jobs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = async (
    resumeId: string,
    jobType?: string,
    location?: string,
  ) => {
    setIsSearching(true);
    try {
      const newJobs = await searchJobs({
        resumeId,
        jobType,
        locationPreference: location,
      });
      setJobs((prev) => [...(newJobs as Job[]), ...prev]);
      setActiveTab("all");
      toast.success(`Found ${newJobs.length} matching jobs!`);
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Failed to search for jobs. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleStatusChange = async (jobId: string, status: JobStatus) => {
    try {
      await updateJobStatus(jobId, status);
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? {
                ...j,
                status,
                ...(status === "APPLIED" ? { appliedAt: new Date() } : {}),
              }
            : j,
        ),
      );
      toast.success(
        status === "SAVED"
          ? "Job saved!"
          : status === "APPLIED"
            ? "Marked as applied!"
            : status === "REJECTED"
              ? "Job rejected"
              : "Status updated",
      );
    } catch {
      toast.error("Failed to update job status");
    }
  };

  const newJobs = jobs.filter((j) => j.status === "NEW");
  const savedJobs = jobs.filter((j) => j.status === "SAVED");
  const appliedJobs = jobs.filter((j) => j.status === "APPLIED");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Job Search</h2>
        <p className="text-muted-foreground">
          Find jobs matching your resume using AI-powered search.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[350px_1fr]">
        <div className="space-y-6">
          <div className="border rounded-lg p-4 bg-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Search Jobs
            </h3>
            <JobSearchForm onSearch={handleSearch} isSearching={isSearching} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="border rounded-lg p-3 text-center bg-card">
              <div className="text-2xl font-bold">{newJobs.length}</div>
              <div className="text-xs text-muted-foreground">New</div>
            </div>
            <div className="border rounded-lg p-3 text-center bg-card">
              <div className="text-2xl font-bold">{savedJobs.length}</div>
              <div className="text-xs text-muted-foreground">Saved</div>
            </div>
            <div className="border rounded-lg p-3 text-center bg-card">
              <div className="text-2xl font-bold">{appliedJobs.length}</div>
              <div className="text-xs text-muted-foreground">Applied</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="search">Search Results</TabsTrigger>
              <TabsTrigger value="all">All Jobs ({jobs.length})</TabsTrigger>
              <TabsTrigger value="saved">
                Saved ({savedJobs.length})
              </TabsTrigger>
              <TabsTrigger value="applied">
                Applied ({appliedJobs.length})
              </TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <TabsContent value="search">
                  {isSearching ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <Loader2 className="w-10 h-10 animate-spin text-primary" />
                      <p className="text-muted-foreground">
                        AI is searching for matching jobs...
                      </p>
                    </div>
                  ) : newJobs.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-muted/10">
                      <Briefcase className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">
                        Select a resume and click "Find Matching Jobs" to get
                        started.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {newJobs.map((j) => (
                        <JobCard
                          key={j.id}
                          job={j}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="all">
                  {jobs.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-muted/10">
                      <p className="text-muted-foreground">
                        No jobs found. Search to discover matching
                        opportunities.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {jobs.map((j) => (
                        <JobCard
                          key={j.id}
                          job={j}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="saved">
                  {savedJobs.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-muted/10">
                      <p className="text-muted-foreground">
                        No saved jobs yet. Save interesting jobs from your
                        search results.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {savedJobs.map((j) => (
                        <JobCard
                          key={j.id}
                          job={j}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="applied">
                  {appliedJobs.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-muted/10">
                      <p className="text-muted-foreground">
                        No applications yet. Mark jobs as applied after you
                        submit.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {appliedJobs.map((j) => (
                        <JobCard
                          key={j.id}
                          job={j}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
