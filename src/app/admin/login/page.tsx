'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import MagicRings from '@/components/MagicRings';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || '';
  const isDemo = searchParams.get('demo') === 'true';

  const [mode, setMode] = useState<'login' | 'register'>('login');
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
              role: 'admin',
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
    // Store demo session in localStorage
    localStorage.setItem('trustchain_session', JSON.stringify({
      user: { email: 'demo@trustchain.io', name: 'Demo Admin' },
      plan: 'pro',
      isDemo: true,
      expiresAt: Date.now() + 30 * 60 * 1000, // 30 min demo
    }));
    router.push('/admin');
  };

  const planLabel = plan === 'ultra' ? 'Ultra Pro' : plan === 'pro' ? 'Pro' : 'Free';

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Admin Portal</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {plan ? `Sign in to activate your ${planLabel} plan` : 'Encrypted admin authentication'}
          </p>
        </div>

        {/* Plan Badge */}
        {plan && (
          <div className={cn(
            'text-center mb-6 py-2 px-4 rounded-full text-sm font-semibold mx-auto w-fit',
            plan === 'ultra' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
          )}>
            🔒 {planLabel} Plan Selected — {plan === 'ultra' ? '$99/mo' : '$29/mo'}
          </div>
        )}

        {/* Auth Form */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
          
          {/* Tab Toggle */}
          <div className="flex mb-6 p-1 bg-secondary/60 rounded-xl">
            <button
              onClick={() => setMode('login')}
              className={cn(
                'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
                mode === 'login' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground'
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={cn(
                'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
                mode === 'register' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground'
              )}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@yourorg.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary focus:outline-none transition text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary focus:outline-none transition text-sm"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl btn-glass-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Encrypting session...</>
              ) : (
                <><Lock className="w-4 h-4" /> {mode === 'login' ? 'Secure Sign In' : 'Create Account'}</>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-muted-foreground">or</span></div>
          </div>

          {/* Demo Access */}
          <button
            onClick={handleDemoLogin}
            className="w-full py-3 rounded-xl btn-glass flex items-center justify-center gap-2 text-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-500" /> Try Demo Admin (30 min)
          </button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            🔐 Sessions encrypted via Supabase Auth with Row Level Security
          </p>
        </div>

        {/* Pricing Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have a plan?{' '}
          <Link href="/pricing" className="text-blue-600 font-semibold hover:underline">
            View pricing →
          </Link>
        </p>
      </motion.div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-6 overflow-hidden">
      {/* Magic Rings Background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <MagicRings 
          color="#3b82f6"      // Blue-500
          colorTwo="#8b5cf6"   // Violet-500
          speed={1.5}
          ringCount={5}
          baseRadius={0.4}
          followMouse={true}
          mouseInfluence={0.5}
          hoverScale={1.1}
          clickBurst={true}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Suspense fallback={<div className="text-center">Loading authentication portal...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
