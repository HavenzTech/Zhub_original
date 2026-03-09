"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Scan, AlertCircle, Loader2 } from "lucide-react";
import { authService } from "@/lib/services/auth";

export default function FaceEnrollmentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = authService.getAuth();
    if (!auth) {
      router.push("/login");
      return;
    }
    // If password change or MFA is still required, handle those first
    if (auth.requiresPasswordChange) {
      router.push("/change-password");
      return;
    }
    if (auth.requiresMfaSetup) {
      router.push("/mfa-setup");
      return;
    }
    // If face enrollment is not required, go to dashboard
    if (!auth.requiresFaceEnrollment) {
      router.push("/");
      return;
    }
    setIsLoading(false);
  }, [router]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // Re-check auth state in case it was completed on another device
    const auth = authService.getAuth();
    if (auth && !auth.requiresFaceEnrollment) {
      router.push("/");
    } else {
      setError("Face enrollment is still required. Please complete enrollment using the Havenz Door Access app on a registered device.");
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted via-background to-secondary/20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking enrollment status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-secondary/20">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-accent/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        </div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(0, 196, 154, 0.15) 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border border-border/20 bg-card/80 backdrop-blur-md">
            <CardHeader className="space-y-1 text-center relative">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Scan className="w-8 h-8 text-white" />
              </div>

              <CardTitle className="text-2xl font-bold text-foreground mb-2">
                Face Enrollment Required
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                Your account requires face enrollment before you can access Havenz Hub
              </CardDescription>

              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border/10">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Required security action</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4 text-center">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900/50">
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    Please complete face enrollment using the <strong>Havenz Door Access</strong> app on a registered device. Once enrollment is complete, click the button below to continue.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    onClick={handleRetry}
                    className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg font-medium"
                  >
                    <Scan className="w-4 h-4 mr-2" />
                    I&apos;ve Completed Enrollment
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
