import type { Metadata } from "next";
import { AppProvider } from "@/components/AppProvider";
import { CustomCursor } from "@/components/CustomCursor";
import "./globals.css";

export const metadata: Metadata = {
  title: "Genesis",
  description: "A lightweight project management CRM for delivery teams.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><AppProvider>{children}</AppProvider><CustomCursor /></body>
    </html>
  );
}
