import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vitality — Referral Handoff",
  description: "A fictional, mock-only community health referral UI preview.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
