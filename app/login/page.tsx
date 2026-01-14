"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Shield, Lock, Zap, Globe, AlertCircle, Eye, EyeOff } from "lucide-react";
import { authService } from "@/lib/services/auth";
import Link from "next/link";
import type { ApiError } from "@/lib/types/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [requiresMfa, setRequiresMfa] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    const auth = authService.getAuth();
    if (auth) {
      // Check for required actions
      if (auth.requiresPasswordChange) {
        router.push("/change-password");
      } else if (auth.requiresMfaSetup) {
        router.push("/mfa-setup");
      } else {
        router.push("/");
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login({
        email,
        password,
        totpCode: requiresMfa ? totpCode : undefined,
      });

      // Check if MFA is required but not provided
      if (response.requiresMfa && !totpCode) {
        setRequiresMfa(true);
        setIsLoading(false);
        return;
      }

      // Store auth data
      authService.storeAuth(response);

      // Get the return URL from query params
      const returnTo = searchParams.get("from") || "/";

      // Check for required actions and redirect accordingly
      if (response.requiresPasswordChange) {
        router.push("/change-password");
      } else if (response.requiresMfaSetup) {
        router.push("/mfa-setup");
      } else {
        router.push(returnTo);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Sophisticated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-secondary/20">
        {/* Geometric shapes for visual interest */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-accent/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent/5 rounded-full blur-xl"></div>
        </div>

        {/* Subtle pattern overlay */}
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
          {/* Floating glass card */}
          <Card className="shadow-2xl border border-border/20 bg-card/80 backdrop-blur-md">
            <CardHeader className="space-y-1 text-center relative">
              {/* Logo with modern styling */}
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <div className="w-8 h-8 bg-primary-foreground rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">H</span>
                </div>
              </div>

              <CardTitle className="text-3xl font-bold text-foreground mb-2">
                Welcome back
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                Sign in to your Havenz Hub account
              </CardDescription>

              {/* Security indicators */}
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border/10">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Shield className="w-3 h-3 text-primary" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3 text-primary" />
                  <span>Encrypted</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Globe className="w-3 h-3 text-primary" />
                  <span>Calgary, AB</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Error message */}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Email field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                  <div className="flex justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                

                {/* TOTP Code field - shown when MFA is required */}
                {requiresMfa && (
                  <div className="space-y-2">
                    <Label htmlFor="totpCode">Authentication Code</Label>
                    <Input
                      id="totpCode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                      required
                      disabled={isLoading}
                      className="h-11 text-center text-lg tracking-widest"
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the code from your authenticator app
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg font-medium transition-all duration-200 hover:shadow-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      {requiresMfa ? "Verify & Sign in" : "Sign in to Havenz Hub"}
                    </div>
                  )}
                </Button>

                <div className="text-xs text-center text-muted-foreground pt-4">
                  <p>Protected by multi-factor authentication</p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
