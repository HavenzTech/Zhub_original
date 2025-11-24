import { AlertTriangle, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: "destructive" | "warning";
  className?: string;
}

export function ErrorDisplay({
  title = "Error",
  message,
  onRetry,
  variant = "destructive",
  className,
}: ErrorDisplayProps) {
  const Icon = variant === "destructive" ? XCircle : AlertTriangle;
  const alertVariant = variant === "destructive" ? "destructive" : "default";

  return (
    <Alert variant={alertVariant} className={cn("my-4", className)}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2 flex flex-col gap-3">
        <span>{message}</span>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="w-fit"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Centered variant for full-page errors
export function ErrorDisplayCentered({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorDisplayProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <div className="max-w-md w-full">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {title}
            </h3>
            <p className="text-muted-foreground">{message}</p>
          </div>
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
