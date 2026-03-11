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
    // 1. Check Supabase session
    const { data: { session: supaSession } } = await supabase.auth.getSession();

    if (supaSession?.user) {
      const plan = (supaSession.user.user_metadata?.plan as string) || 'pro';
      setSession({
        user: { email: supaSession.user.email || '', name: supaSession.user.user_metadata?.name },
        plan,
        isDemo: false,
      });
      fetchCertificates();
      return;
    }

    // 2. Check demo session from localStorage
    const demoRaw = localStorage.getItem('trustchain_session');
    if (demoRaw) {
      try {
        const demo = JSON.parse(demoRaw) as Session;
        if (demo.expiresAt && demo.expiresAt > Date.now()) {
          setSession(demo);
          fetchCertificates();
          return;
        } else {
          localStorage.removeItem('trustchain_session');
        }
      } catch {}
    }

    // 3. No session — redirect to login
    router.push('/admin/login');
  };

  const fetchCertificates = async () => {
    setLoading(true);
    let { data, error } = await supabase
      .from('certificates_v2')
      .select('*')
      .order('issued_at', { ascending: false });

    if (error?.code === '42P01' || !data) {
      const res = await supabase
        .from('certificates')
        .select('*')
        .order('issued_at', { ascending: false });
      data = res.data;
    }

    const certs = data || [];
    setCertificates(certs);
    setStats({
      total: certs.length,
      active: certs.filter((c: any) => c.status === 'active').length,
      revoked: certs.filter((c: any) => c.status === 'revoked' || c.revoked).length,
      verified: certs.length,
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

  const planLabel = session?.plan === 'ultra' ? 'Ultra Pro' : session?.plan === 'pro' ? 'Pro' : 'Free';
  const PlanIcon = session?.plan === 'ultra' ? Crown : session?.plan === 'pro' ? Zap : ShieldCheck;
  const canIssue = session?.plan === 'pro' || session?.plan === 'ultra';

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">Verifying session encryption...</div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Issued', value: stats.total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active', value: stats.active, icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Revoked', value: stats.revoked, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Verifications', value: stats.verified, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      
      {/* Header with session info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Monitor and manage issued credentials.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Plan Badge */}
          <div className={cn(
            'px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2',
            session.plan === 'ultra' ? 'bg-purple-100 text-purple-700' :
            session.plan === 'pro' ? 'bg-blue-100 text-blue-700' :
            'bg-slate-100 text-slate-700'
          )}>
            <PlanIcon className="w-4 h-4" />
            {planLabel}
            {session.isDemo && <span className="text-amber-600 ml-1">(Demo)</span>}
          </div>

          <div className="text-sm text-muted-foreground hidden md:block">
            {session.user.email}
          </div>

          <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-secondary transition" title="Sign Out">
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Demo Banner */}
      {session.isDemo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">Demo Mode Active</p>
              <p className="text-amber-600 text-xs">You have 30 minutes of admin access. Upgrade to Pro for full access.</p>
            </div>
          </div>
          <Link href="/pricing" className="px-4 py-2 btn-glass-primary text-sm rounded-lg">
            Upgrade Now
          </Link>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.bg)}>
                <stat.icon className={cn('w-5 h-5', stat.color)} />
              </div>
              <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold text-primary">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Issue Button (Plan-gated) */}
      <div className="mb-8 flex gap-4">
        {canIssue ? (
          <Link href="/issue" className="px-6 py-3 rounded-xl btn-glass-primary flex items-center gap-2">
            <FileText className="w-4 h-4" /> Issue New Certificate
          </Link>
        ) : (
          <div className="relative">
            <button disabled className="px-6 py-3 rounded-xl bg-slate-100 text-slate-400 flex items-center gap-2 cursor-not-allowed">
              <Lock className="w-4 h-4" /> Issue Certificate
            </button>
            <Link href="/pricing" className="absolute -top-2 -right-2 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">
              PRO
            </Link>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, title, or hash..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/30">
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground whitespace-nowrap">Cert ID</th>
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground">Holder</th>
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground">Certificate</th>
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground">Issuer</th>
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground">Date</th>
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground">Blockchain</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-muted-foreground">
                    <div className="animate-pulse">Loading credentials from Supabase...</div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p className="font-medium">No credentials found</p>
                    <p className="text-xs mt-1">Issue a certificate first to see it here.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((cert, i) => (
                  <motion.tr
                    key={cert.id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                      {cert.id ? (
                         <div className="flex flex-col gap-0.5" title={cert.id}>
                           <span className="font-semibold text-slate-700">{cert.id.split('-')[0]}</span>
                           <span className="text-[9px] opacity-60">...{cert.id.split('-').pop()?.substring(0, 4)}</span>
                         </div>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4 font-medium">{cert.holder_name || '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{cert.title || '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{cert.issuer_name || '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-semibold',
                        cert.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      )}>
                        {cert.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {cert.blockchain_hash ? (
                        <a
                          href={`https://amoy.polygonscan.com/tx/${cert.blockchain_hash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-mono"
                        >
                          {cert.blockchain_hash.substring(0, 12)}...
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
