import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default async function SettingsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <Separator />

            <div className="grid gap-6">
                {/* Profile Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>
                            Your account information.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Name</Label>
                            <Input value={session?.user?.name || ""} disabled />
                        </div>
                        <div className="grid gap-2">
                            <Label>Email</Label>
                            <Input value={session?.user?.email || ""} disabled />
                        </div>
                    </CardContent>
                </Card>

                {/* Google Connection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Connected Accounts</CardTitle>
                        <CardDescription>
                            Manage your connected accounts for sending emails.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                    <svg
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                        focusable="false"
                                        data-prefix="fab"
                                        data-icon="google"
                                        role="img"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 488 512"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                                        ></path>
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium">Google</p>
                                    <p className="text-sm text-muted-foreground">
                                        Used for authentication and sending emails via Gmail.
                                    </p>
                                </div>
                            </div>
                            <div className="text-sm text-green-600 font-medium">Connected</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>
                            Irreversible actions that affect your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive" disabled>
                            Delete Account
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
