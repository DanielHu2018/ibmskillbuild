import { cn } from '@/utils/cn';
import { portfolioImpact } from '@/data/mockData';
import { AlertTriangle, TrendingUp } from 'lucide-react';

export function PortfolioImpactPanel() {
  const breachCount = portfolioImpact.filter(p => p.breached).length;
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Portfolio Impact — Stress Results</h3>
        {breachCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-[10px] font-bold text-red-400">
            <AlertTriangle size={11} />
            {breachCount} BREACHES
          </div>
        )}
      </div>
      <div className="space-y-2">
        {portfolioImpact.map((item) => (
          <div
            key={item.metric}
            className={cn(
              'flex items-center justify-between rounded-lg border px-3 py-2.5',
              item.breached
                ? 'border-red-900/50 bg-red-950/20'
                : 'border-slate-800 bg-slate-950/30'
            )}
          >
            <div className="flex items-center gap-2">
              {item.breached && <AlertTriangle size={12} className="text-red-400" />}
              <span className="text-xs text-slate-300">{item.metric}</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-500">{item.current}M</span>
              <span className="text-slate-700">→</span>
              <span className={item.breached ? 'text-red-400 font-bold' : 'text-amber-400'}>{item.stressed}M</span>
              <div className="flex items-center gap-0.5 text-red-400">
                <TrendingUp size={11} />
                <span>+{item.change.toFixed(0)}%</span>
              </div>
              <span className="text-[10px] text-slate-600">Lim: {item.limit}M</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
