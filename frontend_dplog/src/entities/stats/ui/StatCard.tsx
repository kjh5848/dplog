import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: LucideIcon;
  delay?: number;
}

export const StatCard = ({ title, value, change, trend, icon: Icon, delay = 0 }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="relative group p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-xl hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon className="size-16" />
    </div>
    <div className="flex justify-between items-start mb-4">
      <div className="size-10 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
        <Icon className="size-5" />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
        trend === 'up' ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
      )}>
        {trend === 'up' ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
        {Math.abs(change)}%
      </div>
    </div>
    <div>
      <p className="text-sm text-slate-500 mb-1 font-medium">{title}</p>
      <h3 className="text-2xl font-black tabular-nums tracking-tight">{value}</h3>
    </div>
    <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: '70%' }}
        transition={{ duration: 1, delay: delay + 0.3 }}
        className="h-full bg-blue-600 rounded-full"
      />
    </div>
  </motion.div>
);
