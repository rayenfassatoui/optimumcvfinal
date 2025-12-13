"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { ProfileData } from "@/features/onboarding/types";
import { Loader2 } from "lucide-react";

// Dynamically import the entire PDF preview component to avoid SSR issues
const PDFPreviewContent = dynamic(
    () => import("./resume-preview-content").then((mod) => mod.PDFPreviewContent),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        ),
    }
);

interface ResumePreviewProps {
    data: ProfileData;
}

export function ResumePreview({ data }: ResumePreviewProps) {
    // Debounce the data to prevent too frequent re-renders of PDF
    const [debouncedData, setDebouncedData] = useState(data);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        setIsUpdating(true);
        const timer = setTimeout(() => {
            setDebouncedData(data);
            setIsUpdating(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [data]);

    // Generate a stable key based on data structure to force clean remount when needed
    const previewKey = useMemo(() => {
        return `pdf-${debouncedData.experience?.length || 0}-${debouncedData.education?.length || 0}-${debouncedData.projects?.length || 0}-${debouncedData.skills?.length || 0}`;
    }, [debouncedData]);

    return (
        <div className="h-[calc(100vh-100px)] w-full border rounded-lg overflow-hidden bg-gray-100 relative">
            {isUpdating && (
                <div className="absolute top-2 right-2 z-10 bg-background/80 px-2 py-1 rounded text-xs text-muted-foreground flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Updating...
                </div>
            )}
            <PDFPreviewContent key={previewKey} data={debouncedData} />
        </div>
    );
}
