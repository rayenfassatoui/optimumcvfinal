"use client";

import { FileText, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getResumes } from "@/features/resume/actions/get-resumes";

interface ResumeRecord {
  id: string;
  name: string;
  content: string;
  updatedAt: Date;
}

interface JobSearchFormProps {
  onSearch: (resumeId: string, jobType?: string, location?: string) => void;
  isSearching: boolean;
}

export function JobSearchForm({ onSearch, isSearching }: JobSearchFormProps) {
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [jobType, setJobType] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const data = await getResumes();
        setResumes(data);
        if (data.length > 0) {
          setSelectedResumeId(data[0].id);
        }
      } catch {
        toast.error("Failed to load resumes");
      } finally {
        setIsLoadingResumes(false);
      }
    };
    fetchResumes();
  }, []);

  const handleSubmit = () => {
    if (!selectedResumeId) {
      toast.error("Please select a resume first");
      return;
    }
    onSearch(selectedResumeId, jobType || undefined, location || undefined);
  };

  if (isLoadingResumes) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-3">
        <FileText className="w-10 h-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Create a resume first to search for matching jobs.
        </p>
        <Button asChild size="sm">
          <a href="/dashboard/resume">Create Resume</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select Resume</Label>
        <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a resume" />
          </SelectTrigger>
          <SelectContent>
            {resumes.map((resume) => (
              <SelectItem key={resume.id} value={resume.id}>
                {resume.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Job Type</Label>
          <Select value={jobType} onValueChange={setJobType}>
            <SelectTrigger>
              <SelectValue placeholder="Any type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Input
            placeholder="e.g., Remote, Paris..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={isSearching || !selectedResumeId}
      >
        {isSearching ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Searching for jobs...
          </>
        ) : (
          <>
            <Search className="w-4 h-4 mr-2" />
            Find Matching Jobs
          </>
        )}
      </Button>
    </div>
  );
}
