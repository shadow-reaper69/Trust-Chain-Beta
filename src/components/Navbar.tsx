'use client';

import { ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import PillNav from './PillNav';
import Link from 'next/link';

export default function Navbar() {
  const pathname = usePathname();

  const items = [
    { label: 'Home', href: '/' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Dashboard', href: '/admin' },
    { label: 'Certificate', href: '/verify' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-transparent">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Desktop Logo (Fallback for PillNav's logo) */}
        <div className="flex items-center gap-2">
           <div className="bg-primary/10 p-1.5 rounded-lg">
             <ShieldCheck className="w-5 h-5 text-primary" />
           </div>
           <Link href="/" className="font-bold text-lg tracking-tight transition hover:opacity-80">
             TrustChain
           </Link>
        </div>

        {/* The React Bits Pill Nav */}
        <div className="flex justify-center flex-1 ml-4 absolute left-1/2 -translate-x-1/2">
          <PillNav
             items={items}
             activeHref={pathname}
             baseColor="#060010"
             pillColor="#ffffff"
             hoveredPillTextColor="#ffffff"
             pillTextColor="#111111"
             className="shadow-xl rounded-full border border-gray-100"
          />
        </div>

      </div>
    </header>
  );
}
