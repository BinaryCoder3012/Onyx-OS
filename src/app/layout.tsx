import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Onyx OS — your progress, set in stone",
  description:
    "One workspace for problems solved, contest ratings, a learning roadmap, your resume and the job hunt, with an AI that reads all of it.",
};

export const viewport: Viewport = {
  themeColor: "#100f0e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${hanken.variable}`}>
      <body className="min-h-dvh" suppressHydrationWarning>{children}</body>
    </html>
  );
}
