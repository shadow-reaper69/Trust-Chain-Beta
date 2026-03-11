import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CursorParticles from "@/components/CursorParticles";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TrustChain | Universal Credential Verification",
  description: "Enterprise-grade blockchain credential issuance and verification platform using cryptographic logic and Visual Logical Detection (VLD).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased flex flex-col`}>
        <CursorParticles />
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
