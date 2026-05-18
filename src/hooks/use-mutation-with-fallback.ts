"use client";

import { useState, useCallback } from "react";
import { useNetworkStatus } from "./use-network-status";
import { enqueueRequest, flushRequestQueue } from "@/lib/request-queue";

type MutationOptions<TData, TOptimistic> = {
  url: string;
  method?: "POST" | "PUT" | "PATCH" | "DELETE";
  /** Produces the optimistic state from the current state + new data */
  optimisticUpdater?: (current: TOptimistic, data: TData) => TOptimistic;
  /** Called when server confirms the mutation */
  onSuccess?: (responseData: unknown) => void;
  /** Called when the mutation ultimately fails (not when queued offline) */
  onError?: (message: string) => void;
  /** Called when mutation is queued to offline DB */
  onQueued?: () => void;
};

type MutationResult<TData, TOptimistic> = {
  mutate: (data: TData, currentState?: TOptimistic) => Promise<void>;
  isPending: boolean;
  isQueued: boolean;
  error: string | null;
};

export function useMutationWithFallback<TData, TOptimistic = unknown>(
  options: MutationOptions<TData, TOptimistic>,
  setOptimisticState?: React.Dispatch<React.SetStateAction<TOptimistic>>
): MutationResult<TData, TOptimistic> {
  const { isOnline } = useNetworkStatus();
  const [isPending, setIsPending] = useState(false);
  const [isQueued, setIsQueued] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (data: TData, currentState?: TOptimistic) => {
      setError(null);
      setIsQueued(false);

      // Apply optimistic update
      let snapshot: TOptimistic | undefined;
      if (options.optimisticUpdater && setOptimisticState && currentState !== undefined) {
        snapshot = currentState;
        setOptimisticState(options.optimisticUpdater(currentState, data));
      }

      const body = JSON.stringify(data);

      // If offline, queue immediately
      if (!isOnline) {
        await enqueueRequest({
          url: options.url,
          method: options.method ?? "POST",
          body,
          headers: {},
          enqueuedAt: new Date().toISOString(),
        });
        setIsQueued(true);
        options.onQueued?.();
        return;
      }

      setIsPending(true);
      let waitMs = 200;
      let lastError = "";

      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) await new Promise<void>((r) => setTimeout(r, waitMs));
        waitMs *= 2;

        try {
          const res = await fetch(options.url, {
            method: options.method ?? "POST",
            headers: { "Content-Type": "application/json" },
            body,
          });

          if (res.ok) {
            const responseData = await res.json();
            options.onSuccess?.(responseData);
            setIsPending(false);
            // Flush any previously queued requests
            void flushRequestQueue();
            return;
          }

          const errData = await res.json().catch(() => ({})) as { error?: string };
          lastError = errData.error ?? `HTTP ${res.status}`;
          break; // Don't retry on 4xx
        } catch (e) {
          lastError = e instanceof Error ? e.message : "Network error";
          // Continue retry loop on network errors
        }
      }

      // All attempts failed — rollback optimistic state
      if (snapshot !== undefined && setOptimisticState) {
        setOptimisticState(snapshot);
      }

      // Queue for background sync
      await enqueueRequest({
        url: options.url,
        method: options.method ?? "POST",
        body,
        headers: {},
        enqueuedAt: new Date().toISOString(),
      });
      setIsQueued(true);
      setError(lastError);
      options.onError?.(lastError);
      setIsPending(false);
    },
    [isOnline, options, setOptimisticState]
  );

  return { mutate, isPending, isQueued, error };
}
