import Link from 'next/link';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <Link href="/" className="font-bold text-lg tracking-tight transition hover:opacity-80">
            TrustChain
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/verify" className="text-muted-foreground hover:text-foreground transition-colors">
            Verify Certificate
          </Link>
          <Link href="/issue" className="text-muted-foreground hover:text-foreground transition-colors">
            Issue Credentials
          </Link>
          <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/verify" className="px-4 py-2 rounded-lg btn-glass-primary flex items-center gap-2 text-sm font-medium">
            Scan Document <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
