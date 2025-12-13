"use client";

import { Component, ReactNode } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { ProfileData } from "@/features/onboarding/types";
import { HarvardTemplate } from "./harvard-template";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFPreviewContentProps {
    data: ProfileData;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class PDFErrorBoundary extends Component<
    { children: ReactNode; onRetry: () => void },
    ErrorBoundaryState
> {
    constructor(props: { children: ReactNode; onRetry: () => void }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error) {
        console.error("PDF Preview Error:", error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-muted-foreground" />
                    <div>
                        <p className="font-medium">Preview temporarily unavailable</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            The PDF is being regenerated...
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            this.setState({ hasError: false });
                            this.props.onRetry();
                        }}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Preview
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export function PDFPreviewContent({ data }: PDFPreviewContentProps) {
    const handleRetry = () => {
        // Force re-render by triggering a state update in parent
        window.dispatchEvent(new CustomEvent("pdf-retry"));
    };

    return (
        <PDFErrorBoundary onRetry={handleRetry}>
            <PDFViewer width="100%" height="100%" className="border-none">
                <HarvardTemplate data={data} />
            </PDFViewer>
        </PDFErrorBoundary>
    );
}
