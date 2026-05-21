import { AuthBootstrap } from "@/components/auth/AuthBootstrap";
import { NavBar } from "@/components/shared/NavBar";
import { AppShell } from "@/components/layout";
import { CommandPaletteHost } from "@/components/command/CommandPaletteHost";
import { AppProviders } from "@/providers";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Onyx OS",
  description: "AI-native developer operating system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-carbon antialiased">
        <AppProviders>
          <AuthBootstrap>
            <NavBar />
            <AppShell>{children}</AppShell>
            <Footer />
          </AuthBootstrap>
        </AppProviders>
      </body>
    </html>
  );
}
