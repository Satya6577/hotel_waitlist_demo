'use client';
import { motion } from 'framer-motion';

export function SeatFlowLogo({ size = 32, showText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <motion.div
        initial={{ rotate: -8, scale: 0.9 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6} fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 10c0-3 2-5 5-5h6c3 0 5 2 5 5v3H4v-3z" />
          <path d="M6 13v5" />
          <path d="M18 13v5" />
          <path d="M4 13h16" />
        </svg>
      </motion.div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-tight">SeatFlow</span>
          <span className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase">Queue OS</span>
        </div>
      )}
    </div>
  );
}
