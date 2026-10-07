import type { Metadata } from "next";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "NovaWorks PM - AI Meeting to Project CRM",
  description: "Convert meeting transcripts directly into actionable projects, assignments, and tasks.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 antialiased selection:bg-indigo-500 selection:text-white">
        {user && <Navbar user={user} />}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
