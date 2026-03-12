'use client';

import Link from 'next/link';
import { ShieldCheck, FileCheck2, Hexagon, ArrowRight, ScanLine } from 'lucide-react';
import { GridScan } from '@/components/GridScan';
import DecryptedText from '@/components/DecryptedText';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center relative overflow-hidden py-32 bg-white text-black">
        <div className="absolute inset-0 z-0 opacity-20">
          <GridScan 
            linesColor="#000000" 
            scanColor="#000000" 
            gridScale={0.1} 
            lineThickness={1} 
            bloomIntensity={0}
            enablePost={false}
            scanOpacity={0.05}
          />
        </div>

        <div className="container px-6 relative z-10 mx-auto text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] mb-12 shadow-2xl transform -skew-x-12">
            <ScanLine className="w-4 h-4" />
            <DecryptedText
              text="FORGERY DETECTION ENGINE V2.0 ACTIVE"
              speed={50}
              maxIterations={20}
              animateOn="hover"
            />
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-black mb-10 leading-[0.85] uppercase">
            TRUST <br /> WITHOUT <br /> LIMITS.
          </h1>
          
          <p className="text-xl text-slate-500 mb-16 max-w-2xl mx-auto leading-relaxed font-medium">
            The world's first triple-layer credential ledger. We sync <span className="text-black font-bold">Polygon Blockchain</span>, <span className="text-black font-bold">IPFS Pinata</span>, and <span className="text-black font-bold">Supabase Registry</span> with Visual AI forensics (VLD).
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/verify" className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-black text-white text-lg font-black flex items-center justify-center gap-3 transition-all hover:scale-105 hover:bg-slate-900 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)]">
              VERIFY NOW <FileCheck2 className="w-6 h-6" />
            </Link>
            <Link href="/issue" className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-white border-4 border-black text-black text-lg font-black flex items-center justify-center gap-3 transition-all hover:bg-slate-50 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)]">
              ISSUE CREDENTIAL <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-32 bg-slate-50 border-y-4 border-black relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-black tracking-tighter text-black mb-6 uppercase">Military-Grade Protocol</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">The TrustChain ecosystem operates on a zero-vulnerability perimeter using decentralized storage and visual heuristics.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="p-10 rounded-[2rem] bg-white border-4 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] group hover:-translate-y-2 transition-transform">
              <div className="bg-black w-16 h-16 flex items-center justify-center rounded-2xl mb-8 transform -rotate-12 group-hover:rotate-0 transition-transform">
                <Hexagon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">On-Chain Ledger</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Every document hash is immutable and anchored to the Polygon Proof-of-Stake network, creating a permanent verification proof.
              </p>
            </div>

            <div className="p-10 rounded-[2rem] bg-white border-4 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] group hover:-translate-y-2 transition-transform">
              <div className="bg-black w-16 h-16 flex items-center justify-center rounded-2xl mb-8 transform rotate-6 group-hover:rotate-0 transition-transform">
                <ScanLine className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Visual Forensics</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Gemini 2.0 Flash AI analyzes logo integrity, signature logical flow, and stamp authenticity in real-time.
              </p>
            </div>

            <div className="p-10 rounded-[2rem] bg-white border-4 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] group hover:-translate-y-2 transition-transform">
              <div className="bg-black w-16 h-16 flex items-center justify-center rounded-2xl mb-8 transform -rotate-3 group-hover:rotate-0 transition-transform">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">IPFS Persistence</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Credentials are stored in a distributed peer-to-peer network via Pinata, ensuring your certificates never go offline.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
