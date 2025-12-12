import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Optimum CV Dev Landing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Button asChild variant="default" className="w-full">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Protected Routes</span>
            </div>
          </div>

          <div className="grid gap-2">
            <Button asChild variant="secondary" className="w-full">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/onboarding">Onboarding</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
