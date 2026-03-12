'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const GeminiScan: React.FC = () => {
  return (
    <div className="space-y-4 w-full">
      {/* Primary Scan Bar */}
      <div className="relative w-full h-2 bg-slate-100 overflow-hidden rounded-full border-2 border-black">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-black via-slate-400 to-black"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }}
          style={{ width: '60%' }}
        />
      </div>

      {/* Pulsing Visual Effect */}
      <div className="flex justify-between gap-1 h-8 items-end px-4">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="w-full bg-black"
            animate={{ height: [4, 16, 8, 24, 4] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              delay: i * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black animate-pulse">
          Neural Visual Analysis Core Active
        </p>
      </div>
    </div>
  );
};
