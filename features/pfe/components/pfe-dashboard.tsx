"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { generateTailoredCv } from "../actions/generate-tailored-cv";
import { getTopics } from "../actions/get-topics";
import type { PfeTopic } from "../types";
import { TopicCard } from "./topic-card";
import { UploadBook } from "./upload-book";

type TopicWithCompany = PfeTopic & { companyName: string };

export function PfeDashboard() {
  const [topics, setTopics] = useState<TopicWithCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTopics = async () => {
    setIsLoading(true);
    try {
      const data = await getTopics();
      setTopics(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch topics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const router = useRouter();

  const handleApply = (topicId: string) => {
    router.push(`/dashboard/pfe/${topicId}/apply`);
  };

  const handleGenerateCv = async (topicId: string) => {
    const topic = topics.find((t) => t.id === topicId);
    if (!topic) return;

    // Use the matched resume as base, or fall back to any available
    const baseResumeId = topic.matchedResumeId;
    if (!baseResumeId) {
      toast.error("No base resume available. Please create a resume first.");
      return;
    }

    const toastId = toast.loading("Generating tailored CV for this topic...");
    try {
      const newResume = await generateTailoredCv(topicId, baseResumeId);
      toast.success(`Created "${newResume.name}"! You can now apply with it.`, {
        id: toastId,
      });
      // Refresh topics to show updated match score
      await fetchTopics();
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate tailored CV", { id: toastId });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">PFE Applications</h2>
        <p className="text-muted-foreground">
          Upload PFE books, match topics with your resumes, and apply with
          AI-generated materials.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[350px_1fr]">
        <div className="space-y-6">
          <UploadBook onUploadSuccess={fetchTopics} />
        </div>
        <div className="space-y-6">
          <h3 className="text-xl font-semibold tracking-tight">
            Available Topics
          </h3>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-muted/10">
              <p className="text-muted-foreground">
                No topics found. Upload a PFE book to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {topics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  onApply={handleApply}
                  onGenerateCv={handleGenerateCv}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
