"use client";

import { useEffect } from "react";

interface Metric {
  name: string;
  value: number;
  rating: string;
  id: string;
}

function sendToAnalytics(metric: Metric) {
  // Log to console in development, could send to analytics endpoint in production
  if (process.env.NODE_ENV === "development") {
    console.log(`[Web Vitals] ${metric.name}: ${Math.round(metric.value)} (${metric.rating})`);
  }

  // Send to analytics API if available
  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    navigator.sendBeacon("/api/analytics/vitals", JSON.stringify(metric));
  }
}

export default function WebVitals() {
  useEffect(() => {
    import("web-vitals")
      .then(({ onCLS, onLCP, onFCP, onTTFB, onINP }) => {
        onCLS(sendToAnalytics);
        onLCP(sendToAnalytics);
        onFCP(sendToAnalytics);
        onTTFB(sendToAnalytics);
        onINP(sendToAnalytics);
      })
      .catch(() => {
        // web-vitals not available
      });
  }, []);

  return null;
}
