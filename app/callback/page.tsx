"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { keycloakService } from "@/lib/services/keycloak";
import { authService } from "@/lib/services/auth";
import { Loader2 } from "lucide-react";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false); // Prevent double execution in React Strict Mode

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent double execution
      if (processedRef.current) return;
      processedRef.current = true;

      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (errorParam) {
        setError(errorDescription || errorParam);
        return;
      }

      if (!code) {
        setError("No authorization code received");
        return;
      }

      try {
        // Exchange code for tokens
        const tokens = await keycloakService.handleCallback(code);

        // Get user info from our backend (which validates the token and returns user data)
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${API_BASE_URL}/api/auth/oidc/userinfo`, {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to get user info from backend");
        }

        const userData = await response.json();

        // Store auth data in the same format as the old auth service
        const authData = {
          token: tokens.access_token,
          refreshToken: tokens.refresh_token,
          idToken: tokens.id_token,
          userId: userData.user.userId,
          email: userData.user.email,
          name: userData.user.name,
          companies: userData.companies,
          expiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        };

        authService.storeAuth(authData);

        // Store refresh token separately for token refresh
        if (tokens.refresh_token) {
          localStorage.setItem("refresh_token", tokens.refresh_token);
        }
        if (tokens.id_token) {
          localStorage.setItem("id_token", tokens.id_token);
        }

        // Redirect to the original destination or dashboard
        const returnTo = keycloakService.getReturnUrl();
        router.push(returnTo);
      } catch (err) {
        console.error("Auth callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-destructive text-xl font-semibold">
            Authentication Error
          </div>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="text-primary hover:underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
