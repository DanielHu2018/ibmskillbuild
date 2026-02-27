import { cn } from '@/utils/cn';
import { historicalAnalogs } from '@/data/mockData';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export function AnalogPanel() {
  const barData = historicalAnalogs.map((a) => ({
    name: a.name.split(' ').slice(0, 2).join(' '),
    score: Math.round(a.overallScore * 100),
    spx: a.spxShock,
  }));

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Historical Analog Engine</h3>
        <span className="text-[10px] text-slate-500">Top 5 matches</span>
      </div>

      {/* Similarity Bar Chart */}
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={barData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
          />
          <Bar dataKey="score" radius={[4, 4, 0, 0]} name="Similarity %">
            {barData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? '#06b6d4' : index < 3 ? '#0e7490' : '#164e63'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Analog List */}
      <div className="mt-3 space-y-1.5">
        {historicalAnalogs.map((a, i) => (
          <div key={a.name} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2 text-[11px]">
            <div className="flex items-center gap-2">
              <span className={cn(
                'flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold',
                i === 0 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'
              )}>
                {i + 1}
              </span>
              <div>
                <span className="font-medium text-slate-200">{a.name}</span>
                <span className="ml-2 text-slate-600">{a.date}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 font-mono">
              <span className="text-slate-500">Sem: {(a.semanticSim * 100).toFixed(0)}%</span>
              <span className="text-slate-500">Str: {(a.structuralSim * 100).toFixed(0)}%</span>
              <span className={cn('font-bold', a.overallScore >= 0.8 ? 'text-cyan-400' : a.overallScore >= 0.6 ? 'text-amber-400' : 'text-slate-400')}>
                {(a.overallScore * 100).toFixed(0)}%
              </span>
              <span className="text-red-400">SPX {a.spxShock}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
