"use client";

import React, { Component, type ReactNode } from "react";
import { captureError } from "@/lib/sentry";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string; // used for logging context
};

type State = {
  hasError: boolean;
  errorMessage: string | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    captureError(error, {
      componentStack: info.componentStack,
      boundaryName: this.props.name ?? "unknown",
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/5 p-8 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/15">
            <svg
              className="h-5 w-5 text-rose-600 dark:text-rose-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
            Something went wrong
          </p>
          <p className="mt-1 text-[12px] text-rose-600/70 dark:text-rose-400/50">
            {this.state.errorMessage ?? "An unexpected error occurred in this section."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, errorMessage: null })}
            className="mt-4 rounded-lg bg-rose-600 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-rose-500 transition"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
