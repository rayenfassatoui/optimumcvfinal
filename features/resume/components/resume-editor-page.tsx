"use client";

import { useState } from "react";
import { ProfileData } from "@/features/onboarding/types";
import { ProfileReviewForm } from "@/features/onboarding/components/profile-review-form";
import { ResumePreview } from "./resume-preview";
import { updateProfile } from "@/features/onboarding/actions/update-profile";
import { toast } from "sonner";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2 } from "lucide-react";
import { optimizeResume } from "../actions/optimize-resume";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ResumeEditorPageProps {
    initialData: ProfileData;
}

export function ResumeEditorPage({ initialData }: ResumeEditorPageProps) {
    const [data, setData] = useState<ProfileData>(initialData);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [customInstruction, setCustomInstruction] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSave = async (newData: ProfileData) => {
        try {
            await updateProfile(newData);
            toast.success("Resume saved!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save resume");
        }
    };

    const handleOptimize = async (instruction: string) => {
        setIsOptimizing(true);
        try {
            const optimizedData = await optimizeResume(data, instruction);
            setData(optimizedData);
            toast.success("Resume optimized by AI!");
            setIsDialogOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to optimize resume");
        } finally {
            setIsOptimizing(false);
        }
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b bg-background">
                <h2 className="text-lg font-semibold">Resume Editor</h2>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOptimize("Optimize for ATS")}
                        disabled={isOptimizing}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {isOptimizing ? "Optimizing..." : "Optimize for ATS"}
                    </Button>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={isOptimizing}>
                                <Wand2 className="w-4 h-4 mr-2" />
                                AI Tweak
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>AI Resume Assistant</DialogTitle>
                                <DialogDescription>
                                    Tell the AI how to improve your resume.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="instruction">Instruction</Label>
                                    <Input
                                        id="instruction"
                                        placeholder="e.g., Make it more professional, Fix grammar, Emphasize leadership..."
                                        value={customInstruction}
                                        onChange={(e) => setCustomInstruction(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => handleOptimize(customInstruction)} disabled={isOptimizing || !customInstruction}>
                                    {isOptimizing ? "Processing..." : "Apply Changes"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel defaultSize={50} minSize={30}>
                        <div className="h-full overflow-y-auto p-4">
                            <ProfileReviewForm
                                initialData={initialData}
                                data={data}
                                onChange={setData}
                                onSave={handleSave}
                                submitLabel="Save Changes"
                            />
                        </div>
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={50} minSize={30}>
                        <div className="h-full p-4 bg-muted/20">
                            <ResumePreview data={data} />
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}
