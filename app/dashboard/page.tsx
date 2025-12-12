import { redirect } from "next/navigation";
import { getProfile } from "@/features/onboarding/actions/get-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Sparkles } from "lucide-react";
import Link from "next/link";
import { ProfileData } from "@/features/onboarding/types";

export default async function DashboardPage() {
    const userProfile = await getProfile();

    if (!userProfile) {
        redirect("/onboarding");
    }

    let profileData: ProfileData | null = null;
    try {
        profileData = JSON.parse(userProfile.content);
    } catch (e) {
        // ignore
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Control Center</h2>
                    <p className="text-muted-foreground">
                        Welcome back, {profileData?.fullName || "Student"}. Here's what's happening with your applications.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild>
                        <Link href="/dashboard/pfe">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload PFE Book
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            +0% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resume Score</CardTitle>
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">85/100</div>
                        <p className="text-xs text-muted-foreground">
                            Optimized for ATS
                        </p>
                    </CardContent>
                </Card>
                {/* Add more stats */}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            You haven't applied to any PFEs yet. Upload a PFE book to get started.
                        </p>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/dashboard/resume">
                                <FileText className="mr-2 h-4 w-4" />
                                Edit Resume
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/dashboard/pfe">
                                <Upload className="mr-2 h-4 w-4" />
                                Parse PFE Book
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
