"use client";

import { useState, useEffect } from "react";
import { generateApplicationContent } from "../actions/generate-application-content";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Send, CheckCircle } from "lucide-react";
import { ResumePreview } from "@/features/resume/components/resume-preview";
import { toast } from "sonner";
import { ProfileData } from "@/features/onboarding/types";
import { sendEmail } from "../actions/send-email";

interface ApplicationWizardProps {
    topicId: string;
}

export function ApplicationWizard({ topicId }: ApplicationWizardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("resume");

    const generate = async () => {
        setIsLoading(true);
        try {
            const content = await generateApplicationContent(topicId);
            setGeneratedContent(content);
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate application");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        generate();
    }, [topicId]);

    const handleSend = async () => {
        if (!generatedContent.emailTo) {
            toast.error("Please enter a recipient email address");
            setActiveTab("email");
            return;
        }

        toast.promise(
            sendEmail({
                to: generatedContent.emailTo,
                subject: generatedContent.emailSubject,
                body: generatedContent.emailBody,
            }),
            {
                loading: "Sending email...",
                success: "Application sent successfully!",
                error: "Failed to send email. Check your Google connection.",
            }
        );
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-lg font-medium text-muted-foreground">
                    Generating tailored application materials...
                </p>
                <p className="text-sm text-muted-foreground">
                    Creating custom resume, cover letter, and email.
                </p>
            </div>
        );
    }

    if (!generatedContent) {
        return (
            <div className="text-center">
                <Button onClick={generate}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Review Application</h2>
                <Button onClick={handleSend} className="gap-2">
                    <Send className="w-4 h-4" />
                    Send Application
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="resume">Tailored Resume</TabsTrigger>
                    <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                </TabsList>

                <div className="flex-1 mt-4 border rounded-lg p-4 bg-background overflow-hidden">
                    <TabsContent value="resume" className="h-full mt-0">
                        <div className="h-full overflow-hidden">
                            <ResumePreview data={generatedContent.tailoredResume} />
                        </div>
                    </TabsContent>

                    <TabsContent value="cover-letter" className="h-full mt-0 overflow-y-auto">
                        <div className="space-y-2 h-full">
                            <Label>Cover Letter Content (Markdown)</Label>
                            <Textarea
                                className="h-full font-mono text-sm resize-none"
                                value={generatedContent.coverLetter}
                                onChange={(e) => setGeneratedContent({ ...generatedContent, coverLetter: e.target.value })}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="email" className="h-full mt-0">
                        <div className="space-y-4 h-full flex flex-col">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>To</Label>
                                    <Input
                                        placeholder="recruiter@company.com"
                                        value={generatedContent.emailTo || ""}
                                        onChange={(e) => setGeneratedContent({ ...generatedContent, emailTo: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Subject</Label>
                                    <Input
                                        value={generatedContent.emailSubject}
                                        onChange={(e) => setGeneratedContent({ ...generatedContent, emailSubject: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 flex-1 flex flex-col">
                                <Label>Body</Label>
                                <Textarea
                                    className="flex-1 resize-none"
                                    value={generatedContent.emailBody}
                                    onChange={(e) => setGeneratedContent({ ...generatedContent, emailBody: e.target.value })}
                                />
                            </div>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
