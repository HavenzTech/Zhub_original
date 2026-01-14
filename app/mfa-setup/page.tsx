"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Smartphone, AlertCircle, Copy, CheckCircle2, Loader2 } from "lucide-react";
import { authService } from "@/lib/services/auth";
import type { ApiError, MfaSetupResponse } from "@/lib/types/auth";

export default function MfaSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mfaData, setMfaData] = useState<MfaSetupResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [secretCopied, setSecretCopied] = useState(false);

  // Check if user should be on this page and fetch MFA setup data
  useEffect(() => {
    const initMfaSetup = async () => {
      const auth = authService.getAuth();
      if (!auth) {
        router.push("/login");
        return;
      }
      if (auth.requiresPasswordChange) {
        router.push("/change-password");
        return;
      }
      if (!auth.requiresMfaSetup) {
        router.push("/");
        return;
      }

      try {
        const data = await authService.setupMfa();
        setMfaData(data);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || "Failed to initialize MFA setup");
      } finally {
        setIsLoading(false);
      }
    };

    initMfaSetup();
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    try {
      await authService.verifyMfa({ code: verificationCode });
      router.push("/");
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Invalid verification code. Please try again.");
      setIsVerifying(false);
    }
  };

  const copySecret = async () => {
    if (mfaData?.secret) {
      await navigator.clipboard.writeText(mfaData.secret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    }
  };

  // Generate QR code URL using Google Charts API
  const getQrCodeUrl = (uri: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uri)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted via-background to-secondary/20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Setting up MFA...</p>
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
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Smartphone className="w-8 h-8 text-white" />
              </div>

              <CardTitle className="text-2xl font-bold text-foreground mb-2">
                Set Up Two-Factor Authentication
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                Scan the QR code with your authenticator app
              </CardDescription>

              {/* Security indicator */}
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border/10">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Required security action</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {mfaData && (
                <>
                  {/* QR Code */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-white rounded-lg shadow-inner">
                      <img
                        src={getQrCodeUrl(mfaData.qrCodeUri)}
                        alt="MFA QR Code"
                        width={200}
                        height={200}
                        className="rounded"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Scan this code with Google Authenticator, Authy, or similar app
                    </p>
                  </div>

                  {/* Manual entry option */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground text-center">
                      Can&apos;t scan? Enter this code manually:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-muted rounded text-xs font-mono text-center break-all">
                        {mfaData.secret}
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={copySecret}
                        className="flex-shrink-0"
                      >
                        {secretCopied ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Verification form */}
                  <form onSubmit={handleVerify} className="space-y-4 pt-4 border-t border-border/10">
                    <div className="space-y-2">
                      <Label htmlFor="verificationCode">Verification Code</Label>
                      <Input
                        id="verificationCode"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                        required
                        disabled={isVerifying}
                        className="h-12 text-center text-xl tracking-widest font-mono"
                        autoComplete="one-time-code"
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        Enter the code shown in your authenticator app
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg font-medium transition-all duration-200 hover:shadow-xl"
                      disabled={isVerifying || verificationCode.length !== 6}
                    >
                      {isVerifying ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Verifying...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Verify & Enable MFA
                        </div>
                      )}
                    </Button>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
