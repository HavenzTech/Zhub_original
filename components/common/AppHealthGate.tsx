"use client";

import { useState, useEffect, ReactNode } from "react";
import { Loader2, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHealthGateProps {
  children: ReactNode;
}

type HealthStatus = "checking" | "healthy" | "error";

export function AppHealthGate({ children }: AppHealthGateProps) {
  const [status, setStatus] = useState<HealthStatus>("checking");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const checkHealth = async () => {
    setStatus("checking");
    setErrorMessage("");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!baseUrl) {
        throw new Error("API URL not configured");
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`${baseUrl}/health`, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setStatus("healthy");
      } else {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (error) {
      console.error("Health check failed:", error);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          setErrorMessage("Connection timed out. The server may be starting up.");
        } else if (error.message.includes("fetch")) {
          setErrorMessage("Cannot reach the server. Please check your connection.");
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage("Unable to connect to server.");
      }

      setStatus("error");
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  // Loading state - splash screen
  if (status === "checking") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-6">
          {/* Logo/Brand */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-800">Havenz Hub</h1>
            <p className="text-slate-500">Organizational Intelligence Platform</p>
          </div>

          {/* Spinner */}
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>

          <p className="text-sm text-slate-400">Connecting to server...</p>
        </div>
      </div>
    );
  }

  // Error state - connection failed
  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-6 max-w-md px-4">
          {/* Error Icon */}
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <WifiOff className="w-8 h-8 text-red-600" />
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-800">Unable to Connect</h1>
            <p className="text-slate-600">{errorMessage}</p>
          </div>

          {/* Retry Button */}
          <Button onClick={checkHealth} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>

          {/* Help Text */}
          <p className="text-xs text-slate-400">
            If this problem persists, please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  // Healthy - render the app
  return <>{children}</>;
}
