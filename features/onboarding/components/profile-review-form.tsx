"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileData } from "../types";
import { updateProfile } from "../actions/update-profile";

interface ProfileReviewFormProps {
    initialData: ProfileData;
    data?: ProfileData;
    onChange?: (data: ProfileData) => void;
    onSave?: (data: ProfileData) => Promise<void>;
    submitLabel?: string;
}

export function ProfileReviewForm({ initialData, data: controlledData, onChange, onSave, submitLabel = "Confirm & Continue to Dashboard" }: ProfileReviewFormProps) {
    const [localData, setLocalData] = useState<ProfileData>(initialData);
    const data = controlledData || localData;

    const updateData = (newData: ProfileData) => {
        if (onChange) {
            onChange(newData);
        } else {
            setLocalData(newData);
        }
    };

    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (onSave) {
                await onSave(data);
            } else {
                await updateProfile(data);
                toast.success("Profile updated!");
                router.push("/dashboard");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-3xl">
            <Card>
                <CardHeader>
                    <CardTitle>Review Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input
                                    value={data.fullName}
                                    onChange={(e) => updateData({ ...data, fullName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    value={data.email}
                                    onChange={(e) => updateData({ ...data, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Summary</Label>
                            <Textarea
                                value={data.summary}
                                onChange={(e) => updateData({ ...data, summary: e.target.value })}
                                className="h-32"
                            />
                        </div>

                        {/* Experience Section - Simplified for MVP */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Experience</h3>
                            {data.experience.map((exp, index) => (
                                <Card key={index} className="p-4">
                                    <div className="grid grid-cols-2 gap-4 mb-2">
                                        <Input
                                            placeholder="Title"
                                            value={exp.title}
                                            onChange={(e) => {
                                                const newExp = [...data.experience];
                                                newExp[index].title = e.target.value;
                                                updateData({ ...data, experience: newExp });
                                            }}
                                        />
                                        <Input
                                            placeholder="Company"
                                            value={exp.company}
                                            onChange={(e) => {
                                                const newExp = [...data.experience];
                                                newExp[index].company = e.target.value;
                                                updateData({ ...data, experience: newExp });
                                            }}
                                        />
                                    </div>
                                    <Textarea
                                        placeholder="Description"
                                        value={exp.description}
                                        onChange={(e) => {
                                            const newExp = [...data.experience];
                                            newExp[index].description = e.target.value;
                                            updateData({ ...data, experience: newExp });
                                        }}
                                    />
                                </Card>
                            ))}
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Saving..." : submitLabel}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
