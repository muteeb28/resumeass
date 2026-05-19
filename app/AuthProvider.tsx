"use client";

import { useState, useEffect, ReactNode } from "react";
import { useUserStore } from "@/stores/useUserStore";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // 1. Handle initial Zustand hydration from the cookie
    if (useUserStore.persist.hasHydrated()) {
      setIsHydrated(true);
    } else {
      const unsub = useUserStore.persist.onFinishHydration(() => {
        setIsHydrated(true);
      });
      return () => unsub();
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    // 2. Multi-Tab Syncing: If the user changes tabs or returns to this site,
    // force the Zustand store to instantly re-read the cookie.
    const handleSync = () => {
      if (document.visibilityState === "visible") {
        useUserStore.persist.rehydrate();
      }
    };

    window.addEventListener("visibilitychange", handleSync);
    window.addEventListener("focus", handleSync);

    return () => {
      window.removeEventListener("visibilitychange", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, [isHydrated]);

  // Prevent server-side rendering matching errors
  if (!isHydrated) return null;

  return <>{children}</>;
}