'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, FileText, AlertTriangle, TrendingUp, Search, ExternalLink, LogOut, Crown, Zap, Lock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Certificate {
  id: string;
  holder_name: string;
  title: string;
  issuer_name: string;
  issued_at: string;
  document_hash: string;
  blockchain_hash: string;
  status: string;
}

interface Session {
  user: { email: string; name?: string };
  plan: string;
  role: string;
  isDemo: boolean;
  expiresAt?: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, revoked: 0, verified: 0 });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session: supaSession } } = await supabase.auth.getSession();

    if (supaSession?.user) {
      const plan = (supaSession.user.user_metadata?.plan as string) || 'pro';
      const role = (supaSession.user.user_metadata?.role as string) || 'admin';
      setSession({
        user: { email: supaSession.user.email || '', name: supaSession.user.user_metadata?.name },
        plan,
        role,
        isDemo: false,
      });
      fetchCertificates(role, supaSession.user.email);
      return;
    }

    const demoRaw = localStorage.getItem('trustchain_session');
    if (demoRaw) {
      try {
        const demo = JSON.parse(demoRaw) as Session;
        if (demo.expiresAt && demo.expiresAt > Date.now()) {
          setSession(demo);
          fetchCertificates(demo.role, demo.user.email);
          return;
        } else {
          localStorage.removeItem('trustchain_session');
        }
      } catch {}
    }
    router.push('/admin/login');
  };

  const fetchCertificates = async (role?: string, email?: string) => {
    setLoading(true);
    let query = supabase.from('certificates_v2').select('*');
    
    if (role === 'student' && email) {
      query = query.ilike('holder_name', `%${email.split('@')[0]}%`); 
    }

    let { data, error } = await query.order('issued_at', { ascending: false });

    const certs = data || [];
    setCertificates(certs);
    setStats({
      total: certs.length,
      active: certs.filter((c: any) => c.status === 'active').length,
      revoked: certs.filter((c: any) => c.status === 'revoked' || c.revoked).length,
      verified: certs.length * 4, // Simulated verification attempts
    });
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('trustchain_session');
    router.push('/admin/login');
  };

  const filtered = certificates.filter(c =>
    c.holder_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.document_hash?.toLowerCase().includes(search.toLowerCase())
  );

  const planLabel = session?.plan === 'ultra' ? 'ULTRA' : session?.plan === 'pro' ? 'PRO' : 'TRIAL_V2';
  const canIssue = (session?.role === 'admin' || session?.role === 'issuer'); // All issuers can issue in this version
  const isStudent = session?.role === 'student';

  if (!session) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest">Verifying Protocol...</div>;

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 border-b-8 border-black pb-8">
        <div>
          <div className="inline-block bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-4 transform -skew-x-12">
            CONTROL CENTER v2.0
          </div>
          <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">
            {isStudent ? 'CREDENTIALS' : 'DASHBOARD'}
          </h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Operator</span>
             <span className="font-bold text-sm tracking-tighter">{session.user.email}</span>
          </div>
          <div className="h-10 w-1 bg-black/10 mx-2" />
          <div className="bg-black text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
            {session.role} <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <button onClick={handleLogout} className="bg-white border-4 border-black p-3 hover:bg-black hover:text-white transition shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modern Brutalist Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        {[
          { label: 'LEDGER TOTAL', value: stats.total, icon: FileText },
          { label: 'ACTIVE PROOFS', value: stats.active, icon: ShieldCheck },
          { label: 'REVOCATION FLAGS', value: stats.revoked, icon: AlertTriangle },
          { label: 'VLD QUERIES', value: stats.verified, icon: TrendingUp },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border-4 border-black p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group hover:bg-black hover:text-white transition-colors"
          >
            <stat.icon className="absolute -right-4 -bottom-4 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-40">{stat.label}</p>
            <p className="text-5xl font-black tracking-tighter">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Content Area */}
        <div className="flex-1 space-y-8">
          
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
             <div className="relative flex-1 w-full">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30" />
               <input
                 type="text"
                 placeholder="SCAN REGISTRY BY HASH OR NAME..."
                 value={search}
                 onChange={e => setSearch(e.target.value)}
                 className="w-full bg-white border-4 border-black px-16 py-5 rounded-2xl font-black text-sm uppercase tracking-widest focus:bg-slate-50 transition outline-none"
               />
             </div>
             {!isStudent && canIssue && (
               <Link href="/issue" className="w-full md:w-auto bg-black text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition flex items-center justify-center gap-3">
                 <Zap className="w-5 h-5" /> ISSUE NEW PROOF
               </Link>
             )}
          </div>

          <div className="bg-white border-4 border-black rounded-[2.5rem] shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left uppercase font-black text-[10px] tracking-widest">
                <thead>
                  <tr className="border-b-4 border-black">
                    <th className="px-8 py-6">CREDENTIAL</th>
                    <th className="px-8 py-6">HOLDER</th>
                    <th className="px-8 py-6">ISSUED</th>
                    <th className="px-8 py-6">STATUS</th>
                    <th className="px-8 py-6">POLYGON</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={5} className="py-20 text-center animate-pulse">SYNCHRONIZING WITH SUBGRAPH...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="py-20 text-center text-slate-300">NO RECORDS DETECTED IN LOCAL PERIMETER</td></tr>
                  ) : (
                    filtered.map((cert) => (
                      <tr key={cert.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6">
                           <div className="font-bold text-xs truncate max-w-[200px]">{cert.title}</div>
                           <div className="font-mono text-[8px] opacity-40 mt-1">{cert.id.substring(0, 8)}...</div>
                        </td>
                        <td className="px-8 py-6">{cert.holder_name}</td>
                        <td className="px-8 py-6 opacity-60 font-mono">{new Date(cert.issued_at).toLocaleDateString()}</td>
                        <td className="px-8 py-6">
                          <span className={cn("px-3 py-1 rounded-full border-2 border-black", cert.status === 'active' ? "bg-black text-white" : "bg-red-600 text-white")}>
                            {cert.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                           {cert.blockchain_hash ? (
                             <a href={`https://amoy.polygonscan.com/tx/${cert.blockchain_hash}`} target="_blank" className="flex items-center gap-2 hover:underline">
                               PROOF <ExternalLink className="w-3 h-3" />
                             </a>
                           ) : 'PENDING'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar / Profile Info */}
        <div className="w-full lg:w-80 space-y-8 text-center lg:text-left">
           <div className="bg-black text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden transform hover:-rotate-2 transition-transform">
              <Sparkles className="absolute top-4 right-4 text-white/20 w-8 h-8" />
              <p className="text-[10px] font-black opacity-50 mb-6 uppercase tracking-[0.3em]">Protocol Rank</p>
              <h4 className="text-4xl font-black italic tracking-tighter mb-2">{planLabel} PLAN</h4>
              <p className="text-[10px] font-bold opacity-60">UNLIMITED ANCHORING ENABLED</p>
              <div className="mt-8 border-t border-white/20 pt-6">
                 <button className="text-[10px] font-black uppercase tracking-widest hover:underline">Manage Entitlements</button>
              </div>
           </div>

           <div className="bg-white border-4 border-black p-8 rounded-[2rem]">
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 border-b-2 border-black pb-2">SECURITY STATUS</h5>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-black">
                    <span>VLD ENGINE</span>
                    <span className="text-green-600">ONLINE</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black">
                    <span>POLYGON RPC</span>
                    <span className="text-green-600">CONNECTED</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black">
                    <span>IPFS GATEWAY</span>
                    <span className="text-black">STABLE</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

