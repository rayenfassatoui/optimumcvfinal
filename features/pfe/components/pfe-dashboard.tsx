"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UploadBook } from "./upload-book";
import { TopicCard } from "./topic-card";
import { getTopics } from "../actions/get-topics";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function PfeDashboard() {
    const [topics, setTopics] = useState<any[]>([]);
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

    return (
        <div className="space-y-8">
            <div className="grid gap-8 md:grid-cols-[350px_1fr]">
                <div className="space-y-6">
                    <UploadBook onUploadSuccess={fetchTopics} />
                </div>
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold tracking-tight">Available Topics</h2>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : topics.length === 0 ? (
                        <div className="text-center p-8 border rounded-lg bg-muted/10">
                            <p className="text-muted-foreground">No topics found. Upload a PFE book to get started.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                            {topics.map((topic) => (
                                <TopicCard key={topic.id} topic={topic} onApply={handleApply} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
