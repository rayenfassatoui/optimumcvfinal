"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, PenLine, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createResume } from "../actions/resume-crud";
import { createResumeFromCV } from "../actions/create-from-cv";

interface CreateResumeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateResumeDialog({ open, onOpenChange }: CreateResumeDialogProps) {
    const router = useRouter();
    const [step, setStep] = useState<"choose" | "upload">("choose");
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleCreateFromScratch = async () => {
        setIsLoading(true);
        try {
            const newResume = await createResume("New Resume");
            toast.success("Resume created! Start filling in your details.");
            router.push(`/dashboard/resume/${newResume.id}`);
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to create resume");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type !== "application/pdf") {
                toast.error("Please upload a PDF file");
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleUploadCV = async () => {
        if (!file) {
            toast.error("Please select a PDF file");
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("cv", file);

            const result = await createResumeFromCV(formData);
            toast.success("CV parsed successfully! Review your resume.");
            router.push(`/dashboard/resume/${result.id}`);
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to parse CV. Please try again or create from scratch.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setStep("choose");
        setFile(null);
        setIsLoading(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create New Resume</DialogTitle>
                    <DialogDescription>
                        {step === "choose"
                            ? "Choose how you want to create your resume"
                            : "Upload your existing CV to import your data"}
                    </DialogDescription>
                </DialogHeader>

                {step === "choose" && (
                    <div className="grid gap-4 py-4">
                        <Card
                            className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
                            onClick={handleCreateFromScratch}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <PenLine className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">Start from Scratch</CardTitle>
                                        <CardDescription className="text-sm">
                                            Fill in your information step by step
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <p className="text-sm text-muted-foreground">
                                    Perfect if you're creating your first resume or want full control over the content.
                                </p>
                            </CardContent>
                        </Card>

                        <Card
                            className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
                            onClick={() => setStep("upload")}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Upload className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">Upload Existing CV</CardTitle>
                                        <CardDescription className="text-sm">
                                            Import data from your current resume
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <p className="text-sm text-muted-foreground">
                                    We'll extract your information using AI and let you review it.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {step === "upload" && (
                    <div className="space-y-4 py-4">
                        <div className="flex items-center justify-center w-full">
                            <label
                                htmlFor="cv-upload-dialog"
                                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer border-muted-foreground/25 bg-muted/5 hover:bg-muted/10 transition-colors"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {file ? (
                                        <>
                                            <FileText className="w-10 h-10 mb-3 text-primary" />
                                            <p className="text-sm font-medium text-foreground">{file.name}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Click to change file
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">
                                                <span className="font-medium">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">PDF files only</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    id="cv-upload-dialog"
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setStep("choose")} disabled={isLoading}>
                                Back
                            </Button>
                            <Button onClick={handleUploadCV} disabled={!file || isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Parsing CV...
                                    </>
                                ) : (
                                    "Import CV"
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {step === "choose" && isLoading && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
