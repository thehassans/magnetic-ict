"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const ALLOWED_PREFIXES = [
  "https://chatbot.magnetic-ict.com",
  "https://chat.magnetic-ict.com"
];

function isSafeDestination(url: string) {
  return ALLOWED_PREFIXES.some((prefix) => url.startsWith(prefix));
}

function RelayLogic() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const to = searchParams.get("to");
    if (to && isSafeDestination(to)) {
      window.location.replace(to);
    } else {
      // Fallback: go to main dashboard if destination is missing or not whitelisted
      window.location.replace("/en/dashboard");
    }
  }, [searchParams]);

  return null;
}

export default function RelayPage() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "Inter, Arial, sans-serif",
        background: "#050816",
        color: "#94a3b8",
        fontSize: "15px"
      }}
    >
      <Suspense fallback={null}>
        <RelayLogic />
      </Suspense>
      Redirecting…
    </div>
  );
}
