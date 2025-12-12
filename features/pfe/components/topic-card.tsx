"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PfeTopic } from "../types";

interface TopicCardProps {
    topic: any; // Using any for now as schema type might differ slightly from interface
    onApply: (topicId: string) => void;
}

export function TopicCard({ topic, onApply }: TopicCardProps) {
    const techStack = topic.techStack ? JSON.parse(topic.techStack) : [];

    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">{topic.title}</CardTitle>
                    {topic.referenceNumber && (
                        <Badge variant="outline">{topic.referenceNumber}</Badge>
                    )}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                    {topic.companyName}
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {topic.description}
                </p>
                <div className="flex flex-wrap gap-2">
                    {techStack.map((tech: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                            {tech}
                        </Badge>
                    ))}
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={() => onApply(topic.id)}>
                    Apply with AI
                </Button>
            </CardFooter>
        </Card>
    );
}
