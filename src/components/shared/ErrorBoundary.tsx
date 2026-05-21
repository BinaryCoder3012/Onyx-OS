"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Onyx ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <span className="font-mono text-2xs uppercase tracking-wider text-onyx-danger">
            Module Error
          </span>
          <p className="max-w-sm text-center font-mono text-2xs text-onyx-muted">
            {this.state.error?.message ?? "An unexpected error occurred"}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="border border-graphite-border bg-graphite px-3 py-1.5 font-mono text-2xs uppercase tracking-wider text-onyx-muted transition-colors hover:border-neon-cyan/40 hover:text-onyx-fg"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
