"use client";

import { FileText, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PfeTopic } from "../types";

interface TopicCardProps {
  topic: PfeTopic & { companyName: string };
  onApply: (topicId: string) => void;
  onGenerateCv?: (topicId: string) => void;
}

function getMatchScoreColor(score: number | null | undefined) {
  if (score === null || score === undefined)
    return "bg-muted text-muted-foreground";
  if (score >= 80)
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  if (score >= 60)
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
}

export function TopicCard({ topic, onApply, onGenerateCv }: TopicCardProps) {
  const techStack: string[] = topic.techStack
    ? JSON.parse(topic.techStack)
    : [];
  const hasLowMatch =
    topic.matchScore !== null &&
    topic.matchScore !== undefined &&
    topic.matchScore < 60;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg line-clamp-2">{topic.title}</CardTitle>
          <div className="flex items-center gap-1.5 shrink-0">
            {topic.matchScore !== null && topic.matchScore !== undefined && (
              <Badge className={getMatchScoreColor(topic.matchScore)}>
                {topic.matchScore}% match
              </Badge>
            )}
            {topic.referenceNumber && (
              <Badge variant="outline">{topic.referenceNumber}</Badge>
            )}
          </div>
        </div>
        <div className="text-sm text-muted-foreground font-medium">
          {topic.companyName}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {topic.description}
        </p>
        {topic.matchReason && (
          <p className="text-xs text-muted-foreground/80 italic mb-3">
            {topic.matchReason}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {techStack.map((tech, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button className="flex-1" onClick={() => onApply(topic.id)}>
          <FileText className="w-4 h-4 mr-1.5" />
          Apply with AI
        </Button>
        {hasLowMatch && onGenerateCv && (
          <Button
            variant="outline"
            onClick={() => onGenerateCv(topic.id)}
            title="Generate a CV tailored to this topic"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            Generate CV
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
