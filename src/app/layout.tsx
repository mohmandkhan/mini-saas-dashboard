import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini SaaS Dashboard",
  description: "List, filter, search, add and edit projects.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
