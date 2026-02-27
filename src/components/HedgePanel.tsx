import { cn } from '@/utils/cn';
import { hedgeRecommendations } from '@/data/mockData';
import { Shield, ArrowRight } from 'lucide-react';

const priorityStyles = {
  high: 'bg-red-500/15 text-red-400 border-red-900/30',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-900/30',
  low: 'bg-slate-700/30 text-slate-400 border-slate-700',
};

export function HedgePanel() {
  const totalCost = '$2.84M';
  const avgEffectiveness = Math.round(
    hedgeRecommendations.reduce((s, h) => s + h.effectiveness, 0) / hedgeRecommendations.length
  );

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={15} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Hedge Recommendations</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span>Total Cost: <span className="text-white font-mono">{totalCost}</span></span>
          <span>Avg Eff: <span className="text-emerald-400 font-mono">{avgEffectiveness}%</span></span>
        </div>
      </div>
      <div className="space-y-2">
        {hedgeRecommendations.map((h) => (
          <div key={h.instrument} className="group rounded-lg border border-slate-800 bg-slate-950/50 p-3 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-bold uppercase border', priorityStyles[h.priority])}>
                  {h.priority}
                </span>
                <div>
                  <div className="text-xs font-medium text-slate-200">{h.instrument}</div>
                  <div className="text-[10px] text-slate-500">{h.type} • {h.notional}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="text-right">
                  <div className="font-mono text-slate-300">{h.cost}</div>
                  <div className="text-[10px] text-slate-600">cost</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-emerald-400">{h.effectiveness}%</div>
                  <div className="text-[10px] text-slate-600">effective</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-amber-400">{h.residualTail}%</div>
                  <div className="text-[10px] text-slate-600">residual</div>
                </div>
                <ArrowRight size={14} className="text-slate-700 group-hover:text-cyan-400 transition-colors" />
              </div>
            </div>
            {/* Effectiveness bar */}
            <div className="mt-2 h-1 w-full rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                style={{ width: `${h.effectiveness}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
