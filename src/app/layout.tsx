import type { Metadata } from "next";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Genesis - AI Meeting to Project CRM",
  description: "Convert meeting transcripts directly into actionable projects, assignments, and tasks with Genesis.",
  icons: {
    icon: "/logo_icon.ico",
    shortcut: "/logo_icon.ico",
    apple: "/logo_icon.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/logo_icon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#f8f9fb] text-[#1a1a1a] antialiased selection:bg-[#4617a8] selection:text-white font-sans">
        {user && <Navbar user={user} />}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
