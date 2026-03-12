'use client';

import { ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import PillNav from './PillNav';
import Link from 'next/link';
import DecryptedText from '@/components/DecryptedText';

export default function Navbar() {
  const pathname = usePathname();

  const items = [
    { label: 'HOME', href: '/' },
    { label: 'PRICING', href: '/pricing' },
    { label: 'DASHBOARD', href: '/admin' },
    { label: 'VERIFICATION', href: '/verify' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b-8 border-black py-4">
      <div className="container mx-auto px-6 flex items-center justify-between">
        
        {/* Desktop Logo */}
        <div className="flex items-center gap-4 group">
           <div className="bg-black p-3 rounded-2xl transform -rotate-6 group-hover:rotate-0 transition-transform shadow-[5px_5px_0px_0px_rgba(0,0,0,0.2)]">
             <ShieldCheck className="w-8 h-8 text-white" />
           </div>
           <Link href="/" className="font-black text-3xl tracking-tighter transition hover:opacity-80 text-black flex items-center uppercase leading-none">
             <DecryptedText
               text="TRUSTCHAIN"
               speed={80}
               maxIterations={20}
               animateOn="hover"
             />
           </Link>
        </div>

        {/* The React Bits Pill Nav */}
        <div className="flex items-center gap-8">
          <div className="hidden lg:block">
            <PillNav
               items={items}
               activeHref={pathname}
               baseColor="#000000"
               pillColor="#ffffff"
               hoveredPillTextColor="#000000"
               pillTextColor="#000000"
               className="border-4 border-black"
            />
          </div>
          <Link href="/admin/login" className="px-8 py-3 bg-black text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black border-4 border-black transition-all">
            AUTH_ACCESS
          </Link>
        </div>

      </div>
    </header>
  );
}
