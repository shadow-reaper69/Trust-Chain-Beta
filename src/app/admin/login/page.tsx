'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Sparkles, Loader2, ChevronRight } from 'lucide-react';
import { GridScan } from '@/components/GridScan';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || '';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'admin' | 'issuer' | 'student'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              plan: plan || 'free',
              role: role,
            }
          }
        });
        if (error) throw error;
        router.push('/admin');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    localStorage.setItem('trustchain_session', JSON.stringify({
      user: { email: 'demo@trustchain.io', name: 'Demo Issuer' },
      plan: 'pro',
      role: 'issuer',
      isDemo: true,
      expiresAt: Date.now() + 30 * 60 * 1000,
    }));
    router.push('/admin');
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-6 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-40">
        <GridScan 
          linesColor="#000000" 
          scanColor="#000000" 
          gridScale={0.15} 
          lineThickness={1} 
          bloomIntensity={0}
          enablePost={false}
          scanOpacity={0.1}
          lineJitter={0.05}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-black text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform -rotate-3 hover:rotate-0 transition-transform shadow-[10px_10px_0px_0px_rgba(0,0,0,0.2)]">
            <Lock className="w-12 h-12" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase whitespace-nowrap leading-tight">AUTH PROTOCOL</h1>
          <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em] mt-2">Level-4 Shielded Access Point</p>
        </div>

        <div className="bg-white border-8 border-black p-10 shadow-[30px_30px_0px_0px_rgba(0,0,0,1)] relative">
          <div className="absolute -top-6 -left-6 bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest z-20 transform -rotate-2">
            TERMINAL_SECURE
          </div>
          
          <div className="mb-10">
            <label className="text-[10px] font-black opacity-40 mb-4 block tracking-[0.2em] uppercase">SELECT OPERATOR ROLE</label>
            <div className="flex gap-2">
              {(['student', 'issuer', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "flex-1 py-3 text-[10px] font-black border-4 transition-all uppercase tracking-widest",
                    role === r 
                      ? "bg-black text-white border-black scale-105 z-10" 
                      : "bg-white text-black border-slate-100 hover:border-black opacity-40 hover:opacity-100"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex mb-10 border-b-8 border-slate-100">
            <button onClick={() => setMode('login')} className={cn("flex-1 py-5 text-xs font-black uppercase tracking-widest transition-all", mode === 'login' ? "text-black border-b-8 border-black -mb-[8px] bg-slate-50" : "text-slate-300 hover:text-black")}>INITIATE</button>
            <button onClick={() => setMode('register')} className={cn("flex-1 py-5 text-xs font-black uppercase tracking-widest transition-all", mode === 'register' ? "text-black border-b-8 border-black -mb-[8px] bg-slate-50" : "text-slate-300 hover:text-black")}>REGISTER</button>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
              <ShieldCheck className="w-4 h-4" /> {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block">OPERATOR_ID</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20 group-focus-within:opacity-100 transition-opacity" />
                <input 
                  required 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="ID@TRUSTCHAIN.ARC" 
                  className="w-full pl-14 pr-5 py-5 border-4 border-slate-100 focus:border-black outline-none transition uppercase font-black text-sm tracking-tighter" 
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block">SECURITY_SECRET</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20 group-focus-within:opacity-100 transition-opacity" />
                <input 
                  required 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="w-full pl-14 pr-14 py-5 border-4 border-slate-100 focus:border-black outline-none transition text-sm font-black" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-100 transition-opacity">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-6 bg-black text-white font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 hover:translate-x-2 hover:-translate-y-2 transition shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-0 active:translate-y-0 group">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>
                  INITIALIZE SESSION <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-10 h-1 bg-slate-100 flex items-center justify-center">
             <span className="bg-white px-6 text-[8px] font-black opacity-30 tracking-[0.4em] uppercase">SYSTEM_BYPASS_AVAILABLE</span>
          </div>

          <button onClick={handleDemoLogin} className="w-full py-5 border-4 border-black font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black hover:text-white transition group">
            <Sparkles className="w-5 h-5 text-black group-hover:text-white transition-colors" /> BYPASS AS DEMO_ISSUER
          </button>
        </div>

        <div className="mt-12 text-center opacity-20 font-black text-[10px] tracking-[0.5em] uppercase">
          [ Cryptographic Handshake v2.10.4 ]
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-6">
      <Suspense fallback={<div className="font-black animate-pulse">CRYPTOGRAPHIC SEED LOADING...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
