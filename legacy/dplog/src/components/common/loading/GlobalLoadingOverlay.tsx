"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type GlobalLoadingConfig = {
  message: string;
  size: "sm" | "md" | "lg";
  subMessage?: string;
};

interface GlobalLoadingOverlayProps {
  visible: boolean;
  config: GlobalLoadingConfig;
}

const SIZE_CLASS_MAP: Record<GlobalLoadingConfig["size"], string> = {
  sm: "h-6 w-6 border-b",
  md: "h-8 w-8 border-b-2",
  lg: "h-10 w-10 border-b-2",
};

export default function GlobalLoadingOverlay({
  visible,
  config,
}: GlobalLoadingOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!visible || !mounted) {
    return null;
  }

  const spinnerClass = SIZE_CLASS_MAP[config.size] ?? SIZE_CLASS_MAP.md;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <section
        role="status"
        aria-live="polite"
        className="w-full max-w-sm rounded-2xl bg-white/95 p-6 text-center shadow-2xl"
      >
        <div
          className={`mx-auto mb-4 animate-spin rounded-full border-blue-600 ${spinnerClass}`}
        ></div>
        <p className="text-base font-semibold text-gray-900">
          {config.message}
        </p>
        {config.subMessage && (
          <p className="mt-2 text-sm text-gray-600">{config.subMessage}</p>
        )}
      </section>
    </div>,
    document.body
  );
}
