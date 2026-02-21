import {
  BookOpen,
  Briefcase,
  FileText,
  Sparkles,
  TrendingUp,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getJobs } from "@/features/jobs/actions/get-jobs";
import { getProfile } from "@/features/onboarding/actions/get-profile";
import type { ProfileData } from "@/features/onboarding/types";
import { getTopics } from "@/features/pfe/actions/get-topics";
import { getResumes } from "@/features/resume/actions/get-resumes";

export default async function DashboardPage() {
  const userProfile = await getProfile();

  if (!userProfile) {
    redirect("/onboarding");
  }

  let profileData: ProfileData | null = null;
  try {
    profileData = JSON.parse(userProfile.content);
  } catch {
    console.error("Failed to parse profile data");
  }

  // Fetch real stats
  const [resumes, topics, jobs] = await Promise.all([
    getResumes(),
    getTopics(),
    getJobs(),
  ]);

  const appliedJobs = jobs.filter((j) => j.status === "APPLIED");
  const savedJobs = jobs.filter((j) => j.status === "SAVED");
  const highMatchTopics = topics.filter(
    (t) => t.matchScore !== null && t.matchScore >= 80,
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Control Center</h2>
          <p className="text-muted-foreground">
            Welcome back, {profileData?.fullName || "Student"}. Here's what's
            happening with your applications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/jobs">
              <Briefcase className="mr-2 h-4 w-4" />
              Find Jobs
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/pfe">
              <Upload className="mr-2 h-4 w-4" />
              Upload PFE Book
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resumes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumes.length}</div>
            <p className="text-xs text-muted-foreground">Created resumes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PFE Topics</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topics.length}</div>
            <p className="text-xs text-muted-foreground">
              {highMatchTopics.length} high-match topics
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Matches</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-muted-foreground">
              {savedJobs.length} saved, {appliedJobs.length} applied
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appliedJobs.length}</div>
            <p className="text-xs text-muted-foreground">
              Total applications sent
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {topics.length === 0 && jobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No activity yet. Upload a PFE book or search for jobs to get
                started.
              </p>
            ) : (
              <div className="space-y-3">
                {highMatchTopics.slice(0, 3).map((topic) => (
                  <div
                    key={topic.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {topic.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {topic.companyName} - {topic.matchScore}% match
                      </p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/pfe/${topic.id}/apply`}>
                        Apply
                      </Link>
                    </Button>
                  </div>
                ))}
                {jobs.slice(0, 3).map((j) => (
                  <div
                    key={j.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {j.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {j.company} - {j.matchScore}% match
                      </p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <a href={j.url} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/resume">
                <FileText className="mr-2 h-4 w-4" />
                Manage Resumes
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/pfe">
                <Upload className="mr-2 h-4 w-4" />
                Parse PFE Book
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/jobs">
                <Briefcase className="mr-2 h-4 w-4" />
                Search for Jobs
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/settings">
                <Sparkles className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
