"use client";

import { useEffect, useState } from "react";

export function useCsrfToken() {
  const [csrfToken, setCsrfToken] = useState<string>("");

  useEffect(() => {
    // Fetch CSRF token on mount
    fetch("/api/csrf")
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken))
      .catch((err) => console.error("Failed to fetch CSRF token:", err));
  }, []);

  return csrfToken;
}

// Helper for making protected API calls
export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get CSRF token from cookie or fetch it
  const response = await fetch("/api/csrf");
  const { csrfToken } = await response.json();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "x-csrf-token": csrfToken,
      "Content-Type": "application/json",
    },
  });
}
