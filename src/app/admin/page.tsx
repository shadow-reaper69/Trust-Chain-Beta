'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, FileText, AlertTriangle, Users, TrendingUp, Search, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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

export default function AdminDashboard() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, revoked: 0, verified: 0 });

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    // Try certificates_v2 first, fallback to certificates
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
      verified: certs.length, // all issued are considered verified
    });
    setLoading(false);
  };

  const filtered = certificates.filter(c =>
    c.holder_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.document_hash?.toLowerCase().includes(search.toLowerCase())
  );

  const statCards = [
    { label: 'Total Issued', value: stats.total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active', value: stats.active, icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Revoked', value: stats.revoked, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Verifications', value: stats.verified, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-primary mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor issued credentials, blockchain anchors, and verification logs.</p>
      </div>

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
                  <td colSpan={6} className="text-center py-16 text-muted-foreground">
                    <div className="animate-pulse">Loading credentials from Supabase...</div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted-foreground">
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
