"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AutoRefresh({ isActive }: { isActive: boolean }) {
  const router = useRouter();

  useEffect(() => {
    // If the campaign isn't actively running, don't waste battery refreshing
    if (!isActive) return;

    // Silently ask the server for new data every 5 seconds
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);

    return () => clearInterval(interval);
  }, [isActive, router]);

  // This component doesn't render any visible UI
  return null; 
}