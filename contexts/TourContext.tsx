"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { tourApi } from "@/lib/tour/tour-api";
import { authService } from "@/lib/services/auth";
import type { TourKey, TourStatusMap } from "@/lib/tour/types";

interface TourContextValue {
  /** Map of tourKey → boolean (true = completed) */
  statusMap: TourStatusMap;
  /** Whether the status has been loaded from the API */
  isLoaded: boolean;
  /** Check if a specific tour has been completed */
  isCompleted: (key: TourKey) => boolean;
  /** Mark a tour as completed (persists to API + localStorage) */
  markCompleted: (key: TourKey) => void;
  /** Whether any tour is currently active/running */
  isTourActive: boolean;
  /** Set the active tour state (prevents multiple tours from running) */
  setTourActive: (active: boolean) => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
  const [statusMap, setStatusMap] = useState<TourStatusMap>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTourActive, setTourActive] = useState(false);

  // Fetch tour status on mount
  useEffect(() => {
    const auth = authService.getAuth();
    if (!auth?.userId) {
      setIsLoaded(true);
      return;
    }

    tourApi
      .getStatus(auth.userId)
      .then((data) => {
        setStatusMap(data);
        setIsLoaded(true);
      })
      .catch(() => {
        setIsLoaded(true);
      });
  }, []);

  const isCompleted = useCallback(
    (key: TourKey) => !!statusMap[key],
    [statusMap]
  );

  const markCompleted = useCallback(
    (key: TourKey) => {
      const auth = authService.getAuth();
      if (!auth?.userId) return;

      setStatusMap((prev) => ({ ...prev, [key]: true }));
      tourApi.markCompleted(auth.userId, key);
    },
    []
  );

  return (
    <TourContext.Provider
      value={{
        statusMap,
        isLoaded,
        isCompleted,
        markCompleted,
        isTourActive,
        setTourActive,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

/** Default no-op values when used outside the provider */
const defaultContextValue: TourContextValue = {
  statusMap: {},
  isLoaded: false,
  isCompleted: () => false,
  markCompleted: () => {},
  isTourActive: false,
  setTourActive: () => {},
};

export function useTourContext() {
  const ctx = useContext(TourContext);
  // Return safe defaults when outside provider — the hook will
  // simply not auto-start any tours until isLoaded becomes true
  return ctx ?? defaultContextValue;
}
