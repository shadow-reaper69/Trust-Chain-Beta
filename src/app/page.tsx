'use client';

import Link from 'next/link';
import { ShieldCheck, FileCheck2, Hexagon, ArrowRight, ScanLine } from 'lucide-react';
import { GridScan } from '@/components/GridScan';
import DecryptedText from '@/components/DecryptedText';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center relative overflow-hidden py-24 bg-white">
        {/* React Bits GridScan Background */}
        <div className="absolute inset-0 z-0">
           <GridScan
             enableWebcam={false}
             showPreview={false}
             lineThickness={2}
             linesColor="#e5e7eb"
             scanColor="#111111"
             scanOpacity={0.6}
             gridScale={0.15}
             lineStyle="dashed"
           />
        </div>

        {/* Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-0" />
        <div className="absolute -top-10 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl z-0" />
        <div className="absolute top-20 -left-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl z-0" />

        <div className="container px-6 relative z-10 mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-sm font-semibold mb-8 border border-primary/10">
            <ScanLine className="w-4 h-4" />
            <DecryptedText
              text="VLD Pattern Detection Engine v2.0 Live"
              speed={40}
              maxIterations={15}
              animateOn="hover"
            />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-primary mb-8 leading-tight">
            Universal Credential <br /> Verification Platform
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Instantly issue and verify credentials using Polygon blockchain immutability and our Explainable AI <span className="font-semibold text-primary">Visual Logical Detection (VLD)</span> engine.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/verify" className="w-full sm:w-auto px-8 py-4 rounded-xl btn-glass-primary text-lg flex items-center justify-center gap-2">
              Verify Document <FileCheck2 className="w-5 h-5" />
            </Link>
            <Link href="/issue" className="w-full sm:w-auto px-8 py-4 rounded-xl btn-glass text-lg flex items-center justify-center gap-2">
              Issue Credentials <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 bg-white border-t">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-primary mb-4">Enterprise-grade Security Architecture</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">TrustChain operates on a zero-trust architecture powered by Layer-2 blockchain cryptography and heuristic AI validation.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-secondary/50 border hover:shadow-lg transition">
              <div className="bg-primary/5 w-14 h-14 flex items-center justify-center rounded-xl mb-6 border border-primary/10">
                <Hexagon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Polygon Blockchain</h3>
              <p className="text-muted-foreground leading-relaxed">
                Immutable, timestamped hashes written directly to the Polygon Amoy network guaranteeing zero tampering.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-secondary/50 border hover:shadow-lg transition">
              <div className="bg-blue-500/5 w-14 h-14 flex items-center justify-center rounded-xl mb-6 border border-blue-500/10">
                <ScanLine className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Visual Logical Detection</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our Explainable AI doesn't just pass or fail. It draws exact bounding boxes over suspicious signatures, fonts, and seals.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-secondary/50 border hover:shadow-lg transition">
              <div className="bg-teal-500/5 w-14 h-14 flex items-center justify-center rounded-xl mb-6 border border-teal-500/10">
                <ShieldCheck className="w-7 h-7 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Cryptography</h3>
              <p className="text-muted-foreground leading-relaxed">
                Local SHA-256 generation ensures raw files never leave the browser, keeping sensitive student data 100% private.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
