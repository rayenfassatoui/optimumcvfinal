"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Trash2 } from "lucide-react";
import { ProfileData } from "../types";
import { updateProfile } from "../actions/update-profile";

interface ProfileReviewFormProps {
    initialData: ProfileData;
    data?: ProfileData;
    onChange?: (data: ProfileData) => void;
    onSave?: (data: ProfileData) => Promise<void>;
    submitLabel?: string;
}

export function ProfileReviewForm({
    initialData,
    data: controlledData,
    onChange,
    onSave,
    submitLabel = "Confirm & Continue to Dashboard",
}: ProfileReviewFormProps) {
    const [localData, setLocalData] = useState<ProfileData>(initialData);
    const data = controlledData || localData;
    const [skillInput, setSkillInput] = useState("");

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

    const addExperience = () => {
        updateData({
            ...data,
            experience: [
                ...data.experience,
                { title: "", company: "", startDate: "", endDate: "", description: "" },
            ],
        });
    };

    const removeExperience = (index: number) => {
        const newExp = data.experience.filter((_, i) => i !== index);
        updateData({ ...data, experience: newExp });
    };

    const addEducation = () => {
        updateData({
            ...data,
            education: [
                ...data.education,
                { degree: "", school: "", startDate: "", endDate: "" },
            ],
        });
    };

    const removeEducation = (index: number) => {
        const newEdu = data.education.filter((_, i) => i !== index);
        updateData({ ...data, education: newEdu });
    };

    const addProject = () => {
        updateData({
            ...data,
            projects: [...(data.projects || []), { name: "", description: "", techStack: [] }],
        });
    };

    const removeProject = (index: number) => {
        const newProjects = (data.projects || []).filter((_, i) => i !== index);
        updateData({ ...data, projects: newProjects });
    };

    const addSkill = () => {
        if (skillInput.trim() && !data.skills.includes(skillInput.trim())) {
            updateData({ ...data, skills: [...data.skills, skillInput.trim()] });
            setSkillInput("");
        }
    };

    const removeSkill = (skill: string) => {
        updateData({ ...data, skills: data.skills.filter((s) => s !== skill) });
    };

    return (
        <div className="container mx-auto py-6 max-w-3xl h-full overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input
                                    value={data.phone || ""}
                                    onChange={(e) => updateData({ ...data, phone: e.target.value })}
                                    placeholder="+216 XX XXX XXX"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>LinkedIn URL</Label>
                                <Input
                                    value={data.linkedinUrl || ""}
                                    onChange={(e) => updateData({ ...data, linkedinUrl: e.target.value })}
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Summary</Label>
                            <Textarea
                                value={data.summary || ""}
                                onChange={(e) => updateData({ ...data, summary: e.target.value })}
                                className="h-24"
                                placeholder="A brief professional summary..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Experience */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Experience</CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={addExperience}>
                            <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.experience.map((exp, index) => (
                            <div key={index} className="p-4 border rounded-lg space-y-3 relative">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6"
                                    onClick={() => removeExperience(index)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        placeholder="Job Title"
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
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        placeholder="Start Date (e.g., Jan 2023)"
                                        value={exp.startDate}
                                        onChange={(e) => {
                                            const newExp = [...data.experience];
                                            newExp[index].startDate = e.target.value;
                                            updateData({ ...data, experience: newExp });
                                        }}
                                    />
                                    <Input
                                        placeholder="End Date (or Present)"
                                        value={exp.endDate || ""}
                                        onChange={(e) => {
                                            const newExp = [...data.experience];
                                            newExp[index].endDate = e.target.value;
                                            updateData({ ...data, experience: newExp });
                                        }}
                                    />
                                </div>
                                <Textarea
                                    placeholder="Description of your responsibilities and achievements..."
                                    value={exp.description}
                                    onChange={(e) => {
                                        const newExp = [...data.experience];
                                        newExp[index].description = e.target.value;
                                        updateData({ ...data, experience: newExp });
                                    }}
                                />
                            </div>
                        ))}
                        {data.experience.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No experience added yet. Click "Add" to add your work experience.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Education */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Education</CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={addEducation}>
                            <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.education.map((edu, index) => (
                            <div key={index} className="p-4 border rounded-lg space-y-3 relative">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6"
                                    onClick={() => removeEducation(index)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        placeholder="Degree"
                                        value={edu.degree}
                                        onChange={(e) => {
                                            const newEdu = [...data.education];
                                            newEdu[index].degree = e.target.value;
                                            updateData({ ...data, education: newEdu });
                                        }}
                                    />
                                    <Input
                                        placeholder="School / University"
                                        value={edu.school}
                                        onChange={(e) => {
                                            const newEdu = [...data.education];
                                            newEdu[index].school = e.target.value;
                                            updateData({ ...data, education: newEdu });
                                        }}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        placeholder="Start Date"
                                        value={edu.startDate}
                                        onChange={(e) => {
                                            const newEdu = [...data.education];
                                            newEdu[index].startDate = e.target.value;
                                            updateData({ ...data, education: newEdu });
                                        }}
                                    />
                                    <Input
                                        placeholder="End Date"
                                        value={edu.endDate || ""}
                                        onChange={(e) => {
                                            const newEdu = [...data.education];
                                            newEdu[index].endDate = e.target.value;
                                            updateData({ ...data, education: newEdu });
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                        {data.education.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No education added yet. Click "Add" to add your education.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Skills */}
                <Card>
                    <CardHeader>
                        <CardTitle>Skills</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add a skill..."
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addSkill();
                                    }
                                }}
                            />
                            <Button type="button" variant="outline" onClick={addSkill}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-sm py-1 px-3">
                                    {skill}
                                    <button
                                        type="button"
                                        onClick={() => removeSkill(skill)}
                                        className="ml-2 hover:text-destructive"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                            {data.skills.length === 0 && (
                                <p className="text-sm text-muted-foreground">No skills added yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Projects */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Projects</CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={addProject}>
                            <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(data.projects || []).map((proj, index) => (
                            <div key={index} className="p-4 border rounded-lg space-y-3 relative">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6"
                                    onClick={() => removeProject(index)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                                <Input
                                    placeholder="Project Name"
                                    value={proj.name}
                                    onChange={(e) => {
                                        const newProjects = [...(data.projects || [])];
                                        newProjects[index].name = e.target.value;
                                        updateData({ ...data, projects: newProjects });
                                    }}
                                />
                                <Textarea
                                    placeholder="Project description..."
                                    value={proj.description}
                                    onChange={(e) => {
                                        const newProjects = [...(data.projects || [])];
                                        newProjects[index].description = e.target.value;
                                        updateData({ ...data, projects: newProjects });
                                    }}
                                />
                                <Input
                                    placeholder="Tech Stack (comma-separated)"
                                    value={proj.techStack.join(", ")}
                                    onChange={(e) => {
                                        const newProjects = [...(data.projects || [])];
                                        newProjects[index].techStack = e.target.value
                                            .split(",")
                                            .map((t) => t.trim())
                                            .filter(Boolean);
                                        updateData({ ...data, projects: newProjects });
                                    }}
                                />
                            </div>
                        ))}
                        {(data.projects || []).length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No projects added yet. Click "Add" to add your projects.
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Saving..." : submitLabel}
                </Button>
            </form>
        </div>
    );
}
