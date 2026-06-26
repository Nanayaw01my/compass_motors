"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div
      style={{ background: "#f5f5f0", minHeight: "100vh" }}
      className="flex items-center justify-center p-6"
    >
      <div className="text-center max-w-md">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "linear-gradient(135deg, #b91c1c, #7f1d1d)" }}
        >
          <span className="text-white text-3xl font-black">!</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-400 mb-2">
          An unexpected error occurred. Our team has been notified.
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-gray-300 mb-6">Error ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all"
          style={{ background: "linear-gradient(135deg, #b91c1c, #7f1d1d)" }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
