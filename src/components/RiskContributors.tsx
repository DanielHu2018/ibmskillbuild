import { riskContributors } from '@/data/mockData';
import { cn } from '@/utils/cn';

const sectorColors: Record<string, string> = {
  Semiconductors: 'bg-purple-500',
  Technology: 'bg-blue-500',
  Rates: 'bg-amber-500',
  Financials: 'bg-emerald-500',
  FX: 'bg-cyan-500',
  Credit: 'bg-red-500',
  Energy: 'bg-orange-500',
};

export function RiskContributors() {
  const maxContribution = Math.max(...riskContributors.map((r) => r.contribution));

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Top Marginal Risk Contributors</h3>
        <span className="text-[10px] text-slate-500">% of total VaR</span>
      </div>
      <div className="space-y-2">
        {riskContributors.map((r) => (
          <div key={r.name} className="flex items-center gap-3">
            <span className="w-12 text-xs font-mono font-bold text-slate-200">{r.name}</span>
            <div className="flex-1 h-5 rounded bg-slate-800 relative overflow-hidden">
              <div
                className={cn('h-full rounded transition-all duration-700', sectorColors[r.sector] || 'bg-slate-600')}
                style={{ width: `${(r.contribution / maxContribution) * 100}%`, opacity: 0.7 }}
              />
              <span className="absolute inset-y-0 right-2 flex items-center text-[10px] font-mono text-slate-300">
                {r.contribution}%
              </span>
            </div>
            <span className="w-24 text-[10px] text-slate-500">{r.sector}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
