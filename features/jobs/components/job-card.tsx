"use client";

import {
  Bookmark,
  Briefcase,
  Building2,
  CheckCircle,
  DollarSign,
  ExternalLink,
  MapPin,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Job, JobStatus } from "../types";

interface JobCardProps {
  job: Job;
  onStatusChange: (jobId: string, status: JobStatus) => void;
}

function getMatchScoreColor(score: number | null) {
  if (!score) return "bg-muted text-muted-foreground";
  if (score >= 80)
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  if (score >= 60)
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
}

function getStatusBadge(status: string) {
  switch (status) {
    case "SAVED":
      return <Badge variant="secondary">Saved</Badge>;
    case "APPLIED":
      return <Badge className="bg-green-600 hover:bg-green-700">Applied</Badge>;
    case "REJECTED":
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="outline">New</Badge>;
  }
}

export function JobCard({ job, onStatusChange }: JobCardProps) {
  const techStack: string[] = job.techStack ? JSON.parse(job.techStack) : [];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            {job.matchScore !== null && (
              <Badge className={getMatchScoreColor(job.matchScore)}>
                {job.matchScore}%
              </Badge>
            )}
            {getStatusBadge(job.status)}
          </div>
        </div>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span className="font-medium">{job.company}</span>
          </div>
          {job.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{job.location}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            {job.salary && (
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                <span>{job.salary}</span>
              </div>
            )}
            {job.jobType && (
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                <span className="capitalize">{job.jobType}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {job.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {job.description}
          </p>
        )}
        {job.matchReason && (
          <p className="text-xs text-muted-foreground/80 italic mb-3">
            {job.matchReason}
          </p>
        )}
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {techStack.map((tech, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="gap-2 flex-wrap">
        <Button size="sm" className="flex-1" asChild>
          <a href={job.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            Open Link
          </a>
        </Button>
        {job.status === "NEW" && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(job.id, "SAVED")}
            >
              <Bookmark className="w-3.5 h-3.5 mr-1.5" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(job.id, "APPLIED")}
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
              Mark Applied
            </Button>
          </>
        )}
        {job.status === "SAVED" && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(job.id, "APPLIED")}
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
              Applied
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onStatusChange(job.id, "REJECTED")}
            >
              <XCircle className="w-3.5 h-3.5 mr-1.5" />
              Reject
            </Button>
          </>
        )}
        {job.status === "APPLIED" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onStatusChange(job.id, "REJECTED")}
          >
            <XCircle className="w-3.5 h-3.5 mr-1.5" />
            Reject
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
