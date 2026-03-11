'use client';

import { ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import PillNav from './PillNav';
import Link from 'next/link';
import DecryptedText from '@/components/DecryptedText';

export default function Navbar() {
  const pathname = usePathname();

  const items = [
    { label: 'Home', href: '/' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Dashboard', href: '/admin' },
    { label: 'Certificate', href: '/verify' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-b from-[#060010] via-[#060010]/80 to-transparent pb-4">
      <div className="container mx-auto px-6 pt-6 flex items-center justify-start gap-8">
        
        {/* Desktop Logo */}
        <div className="flex items-center gap-2">
           <div className="bg-sky-500/20 p-2 rounded-xl border border-sky-500/30">
             <ShieldCheck className="w-5 h-5 text-sky-400" />
           </div>
           <Link href="/" className="font-bold text-xl tracking-tight transition hover:opacity-80 text-white flex items-center">
             <DecryptedText
               text="TrustChain"
               speed={60}
               maxIterations={15}
               animateOn="hover"
             />
           </Link>
        </div>

        {/* The React Bits Pill Nav */}
        <div className="flex">
          <PillNav
             items={items}
             activeHref={pathname}
             baseColor="#111111"
             pillColor="#ffffff"
             hoveredPillTextColor="#ffffff"
             pillTextColor="#111111"
             className="shadow-xl rounded-full border border-gray-800/50 backdrop-blur-md"
          />
        </div>

      </div>
    </header>
  );
}
