import { cn } from '@/utils/cn';
import { correlationData } from '@/data/mockData';

export function CorrelationPanel() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Correlation Regime Shift</h3>
        <span className="text-[10px] text-slate-500">Normal → Stressed</span>
      </div>
      <div className="space-y-2">
        {correlationData.map((c) => {
          const shift = Math.abs(c.stressed - c.normal);
          const isConverging = Math.abs(c.stressed) > Math.abs(c.normal);
          return (
            <div key={`${c.x}-${c.y}`} className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">{c.x} / {c.y}</span>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-500">{c.normal.toFixed(2)}</span>
                  <span className="text-slate-700">→</span>
                  <span className={cn(
                    'font-bold',
                    isConverging ? 'text-red-400' : 'text-emerald-400'
                  )}>
                    {c.stressed.toFixed(2)}
                  </span>
                  <span className={cn(
                    'text-[10px]',
                    shift > 0.15 ? 'text-red-400' : 'text-amber-400'
                  )}>
                    Δ{shift.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mt-1.5 flex gap-1">
                <div className="flex-1">
                  <div className="h-1 w-full rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-slate-500"
                      style={{ width: `${Math.abs(c.normal) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="h-1 w-full rounded-full bg-slate-800">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        isConverging ? 'bg-red-500' : 'bg-emerald-500'
                      )}
                      style={{ width: `${Math.abs(c.stressed) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
