"use client";

import { useState } from "react";
import { Upload, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function UploadBook({ onUploadSuccess }: { onUploadSuccess: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [companyName, setCompanyName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !companyName) {
            toast.error("Please provide a file and company name");
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("companyName", companyName);

            const res = await fetch("/api/pfe/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to upload");
            }

            toast.success("PFE Book parsed successfully!");
            onUploadSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to parse PFE Book");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upload PFE Book</CardTitle>
                <CardDescription>Upload a PDF containing internship topics.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="company">Company Name</Label>
                        <Input
                            id="company"
                            placeholder="e.g., Vermeg, Instadeep..."
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="book-upload">PFE Book (PDF)</Label>
                        <div className="flex items-center justify-center w-full">
                            <label
                                htmlFor="book-upload"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-muted-foreground/25 bg-muted/5 hover:bg-muted/10 transition-colors"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {file ? (
                                        <>
                                            <FileText className="w-8 h-8 mb-2 text-primary" />
                                            <p className="text-sm text-foreground font-medium">{file.name}</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">Click to upload PDF</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    id="book-upload"
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Parsing Topics...
                            </>
                        ) : (
                            "Upload & Parse"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
