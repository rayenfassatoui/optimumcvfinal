"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Linkedin, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { processOnboarding } from "@/features/onboarding/actions/process-onboarding";

export function OnboardingForm() {
    const [file, setFile] = useState<File | null>(null);
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file && !linkedinUrl) {
            toast.error("Please upload a CV or provide a LinkedIn URL");
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            if (file) formData.append("cv", file);
            formData.append("linkedinUrl", linkedinUrl);

            const result = await processOnboarding(formData);

            if (result.redirectUrl) {
                toast.success("Profile parsed! Please review.");
                router.push(result.redirectUrl);
            } else {
                toast.success("Profile created successfully!");
                router.push("/dashboard");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-lg border-border/50 shadow-xl backdrop-blur-sm bg-card/50">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Welcome to Optimum CV</CardTitle>
                    <CardDescription>
                        Let's set up your profile. Upload your CV or provide your LinkedIn profile to get started.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="cv-upload">Upload CV (PDF)</Label>
                            <div className="flex items-center justify-center w-full">
                                <label
                                    htmlFor="cv-upload"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-muted-foreground/25 bg-muted/5 hover:bg-muted/10 transition-colors"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            {file ? file.name : "Click to upload or drag and drop"}
                                        </p>
                                    </div>
                                    <input
                                        id="cv-upload"
                                        type="file"
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or / And</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn URL</Label>
                            <div className="relative">
                                <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="linkedin"
                                    placeholder="https://linkedin.com/in/..."
                                    className="pl-9"
                                    value={linkedinUrl}
                                    onChange={(e) => setLinkedinUrl(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Continue to Dashboard
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
