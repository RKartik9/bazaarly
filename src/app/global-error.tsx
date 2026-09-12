"use client";

import { ErrorView } from "@/components/feedback/error-view";
import "./globals.css";

export default function GlobalError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center">
        <ErrorView {...props} />
      </body>
    </html>
  );
}
