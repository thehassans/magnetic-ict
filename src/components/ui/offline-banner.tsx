"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReturned, setShowReturned] = useState(false);

  useEffect(() => {
    // Initialise from actual browser state
    setIsOnline(navigator.onLine);

    function handleOnline() {
      setIsOnline(true);
      setShowReturned(true);
      setTimeout(() => setShowReturned(false), 3000);
    }
    function handleOffline() {
      setIsOnline(false);
      setShowReturned(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const visible = !isOnline || showReturned;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-5 left-1/2 z-[9999] -translate-x-1/2 transition-all duration-500",
        visible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-full border px-5 py-2.5 shadow-2xl text-sm font-semibold backdrop-blur-sm",
          isOnline
            ? "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/90 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300"
            : "border-rose-200 dark:border-rose-500/30 bg-rose-50/90 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300"
        )}
      >
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            Back online
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 animate-pulse" />
            No internet connection — changes will sync when you&apos;re back
          </>
        )}
      </div>
    </div>
  );
}
