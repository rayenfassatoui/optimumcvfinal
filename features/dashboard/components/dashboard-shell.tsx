"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, BookOpen, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface DashboardShellProps {
    children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        {
            title: "Control Center",
            href: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "My Resume",
            href: "/dashboard/resume",
            icon: FileText,
        },
        {
            title: "PFE Applications",
            href: "/dashboard/pfe",
            icon: BookOpen,
        },
        {
            title: "Settings",
            href: "/dashboard/settings",
            icon: Settings,
        },
    ];

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push("/auth/signin");
    };

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="hidden w-64 border-r bg-card/50 backdrop-blur-sm md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold tracking-tight">Optimum CV</h1>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                pathname === item.href
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.title}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
                        onClick={handleSignOut}
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto p-6 md:p-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
