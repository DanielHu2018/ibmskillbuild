import { cn } from '@/utils/cn';
import { shockMatrix } from '@/data/mockData';

export function ShockMatrix() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Shock Matrix — Factor Scenarios</h3>
        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-semibold text-amber-400 uppercase">
          Regime-Adjusted
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500">
              <th className="pb-2 text-left font-medium">Factor</th>
              <th className="pb-2 text-right font-medium">Base</th>
              <th className="pb-2 text-right font-medium">Adverse (95)</th>
              <th className="pb-2 text-right font-medium">Severe (99)</th>
              <th className="pb-2 text-right font-medium">Confidence</th>
              <th className="pb-2 text-left font-medium pl-3">Analog Reference</th>
            </tr>
          </thead>
          <tbody>
            {shockMatrix.map((s) => (
              <tr key={s.factor} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 font-medium text-slate-200">{s.factor}</td>
                <td className={cn('py-2.5 text-right font-mono', s.baseCase < 0 ? 'text-red-400' : 'text-emerald-400')}>
                  {s.baseCase > 0 ? '+' : ''}{s.baseCase}%
                </td>
                <td className={cn('py-2.5 text-right font-mono', s.adverseCase < 0 ? 'text-red-400' : s.adverseCase > 10 ? 'text-amber-400' : 'text-amber-400')}>
                  {s.adverseCase > 0 ? '+' : ''}{s.adverseCase}%
                </td>
                <td className={cn('py-2.5 text-right font-mono font-bold', s.severeCase < 0 ? 'text-red-500' : 'text-red-400')}>
                  {s.severeCase > 0 ? '+' : ''}{s.severeCase}%
                </td>
                <td className="py-2.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-1.5 w-12 rounded-full bg-slate-800">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          s.confidence >= 80 ? 'bg-emerald-500' :
                          s.confidence >= 65 ? 'bg-amber-500' : 'bg-red-500'
                        )}
                        style={{ width: `${s.confidence}%` }}
                      />
                    </div>
                    <span className="font-mono text-slate-400">{s.confidence}%</span>
                  </div>
                </td>
                <td className="py-2.5 pl-3 text-slate-500">{s.analogRef}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
