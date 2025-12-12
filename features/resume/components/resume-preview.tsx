"use client";

import dynamic from "next/dynamic";
import { ProfileData } from "@/features/onboarding/types";
import { HarvardTemplate } from "./harvard-template";
import { Loader2 } from "lucide-react";

const PDFViewer = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        ),
    }
);

interface ResumePreviewProps {
    data: ProfileData;
}

export function ResumePreview({ data }: ResumePreviewProps) {
    return (
        <div className="h-[calc(100vh-100px)] w-full border rounded-lg overflow-hidden bg-gray-100">
            <PDFViewer width="100%" height="100%" className="border-none">
                <HarvardTemplate data={data} />
            </PDFViewer>
        </div>
    );
}
