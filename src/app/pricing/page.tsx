'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import LiquidEther from '@/components/LiquidEther';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    description: 'Verify certificates with basic VLD analysis.',
    features: [
      'Unlimited certificate verification',
      'Basic VLD overlay',
      'SHA-256 hash check',
      'Polygon ledger lookup',
    ],
    disabledFeatures: [
      'Issue certificates',
      'Admin dashboard',
      'Gemini AI forensic analysis',
      'Bulk issuance',
      'API access',
    ],
    cta: 'Get Started Free',
    href: '/verify',
    icon: Shield,
    popular: false,
    tier: 'free',
    gradient: 'from-slate-500 to-slate-700',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'Full admin access to issue & manage credentials.',
    features: [
      'Everything in Starter',
      'Issue up to 500 certificates/mo',
      'Admin Dashboard access',
      'Gemini AI forensic analysis',
      'VLD bounding box reports',
      'Email support',
    ],
    disabledFeatures: [
      'Unlimited issuance',
      'Bulk CSV upload',
      'Dedicated API key',
    ],
    cta: 'Start Pro Trial',
    href: '/admin/login?plan=pro',
    icon: Zap,
    popular: true,
    tier: 'pro',
    gradient: 'from-blue-600 to-indigo-700',
  },
  {
    name: 'Ultra Pro',
    price: '$99',
    period: '/month',
    description: 'Enterprise-grade issuance with unlimited access.',
    features: [
      'Everything in Pro',
      'Unlimited certificate issuance',
      'Bulk CSV upload & batch issue',
      'Dedicated REST API key',
      'Custom branding on certificates',
      'Priority Gemini AI queue',
      'Webhook integrations',
      '24/7 priority support',
    ],
    disabledFeatures: [],
    cta: 'Contact Sales',
    href: '/admin/login?plan=ultra',
    icon: Crown,
    popular: false,
    tier: 'ultra',
    gradient: 'from-purple-600 to-pink-600',
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'weekly'>('monthly');

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.price === 'Free') return 'Free';
    const monthlyNum = parseInt(plan.price.replace('$', ''));
    if (billing === 'weekly') {
      return `$${Math.ceil(monthlyNum / 4)}`;
    }
    return plan.price;
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#060611] text-white flex flex-col items-center py-16 overflow-hidden">
      {/* Liquid Ether Background */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen">
         <LiquidEther
           mouseForce={0.5}
           cursorSize={40}
           isViscous={true}
           viscous={35}
           // Use sky blue/cyan dark theme colors
           colors={['#0e172a', '#0284c7', '#0369a1']}
           autoDemo={true}
         />
      </div>

      <div className="container px-6 max-w-6xl relative z-10">
        <div className="text-center mb-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold text-white mb-4"
        >
          Choose Your Plan
        </motion.h1>
        <p className="text-lg text-sky-100/70 max-w-2xl mx-auto mb-8">
          Verify certificates for free. Upgrade to Pro or Ultra Pro for admin access, AI-powered issuance, and enterprise features.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-1 p-1 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
          <button
            onClick={() => setBilling('weekly')}
            className={cn(
              'px-5 py-2 rounded-full text-sm font-medium transition-all',
              billing === 'weekly' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
            )}
          >
            Weekly
          </button>
          <button
            onClick={() => setBilling('monthly')}
            className={cn(
              'px-5 py-2 rounded-full text-sm font-medium transition-all',
              billing === 'monthly' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
            )}
          >
            Monthly
            <span className="ml-1 text-xs text-green-600 font-bold">Save 20%</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className={cn(
              'relative rounded-3xl p-8 flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl',
              plan.popular && 'border-sky-500/50 ring-2 ring-sky-500/20 scale-[1.02] bg-white/10'
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-sky-500 text-white text-xs font-bold rounded-full shadow-[0_0_15px_rgba(14,165,233,0.5)]">
                MOST POPULAR
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br text-white', plan.gradient)}>
                <plan.icon className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold">{plan.name}</h3>
            </div>

            <div className="mb-4">
              <span className="text-4xl font-extrabold">{getPrice(plan)}</span>
              {plan.period && (
                <span className="text-sky-100/50 text-sm">
                  {billing === 'weekly' ? '/week' : plan.period}
                </span>
              )}
            </div>

            <p className="text-sm text-sky-100/70 mb-6">{plan.description}</p>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
              {plan.disabledFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-400">
                  <Check className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                  <span className="line-through">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.href}
              className={cn(
                'w-full py-3 rounded-xl text-center font-semibold flex items-center justify-center gap-2 transition-all border',
                plan.popular
                  ? 'bg-sky-500 hover:bg-sky-400 border-sky-400 text-white shadow-[0_0_20px_rgba(14,165,233,0.3)]'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
              )}
            >
              {plan.cta} <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-12 relative z-10">
        <p className="text-sky-100/70 text-sm">
          Want to try admin features first?{' '}
          <Link href="/admin/login?demo=true" className="text-sky-400 font-semibold hover:text-sky-300 transition-colors">
            Try the free demo →
          </Link>
        </p>
      </div>
    </div>
  </div>
  );
}
