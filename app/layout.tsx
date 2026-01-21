import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Claude Code Quest",
  description: "Learn Claude Code through gamified quizzes",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-900 text-white">
        {/* Centered container - full width on mobile, max 448px on desktop */}
        <div className="mx-auto max-w-md w-full min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
