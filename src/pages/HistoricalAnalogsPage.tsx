import { useState } from 'react';
import { cn } from '@/utils/cn';
import { historicalAnalogs } from '@/data/mockData';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

const analogDetails: Record<string, { narrative: string; sectors: string[]; factors: { name: string; shock: number }[] }> = {
  'US-China Trade War': {
    narrative: 'Escalating tariffs between US and China disrupted global supply chains, particularly in technology and semiconductors. Market impact concentrated in export-heavy sectors with significant Asia exposure.',
    sectors: ['Technology', 'Semiconductors', 'Industrials', 'Materials'],
    factors: [
      { name: 'SPX', shock: -6.8 },
      { name: 'SOX', shock: -12.4 },
      { name: 'VIX', shock: 45.2 },
      { name: 'USD/CNY', shock: 4.2 },
      { name: 'IG Spread', shock: 25 },
    ],
  },
  'COVID Market Crash': {
    narrative: 'Pandemic-driven global economic shutdown. Unprecedented liquidity crisis, correlation spike to near 1.0, and VIX at all-time highs. Central bank intervention eventually stabilized markets.',
    sectors: ['All Sectors', 'Travel', 'Energy', 'Financials'],
    factors: [
      { name: 'SPX', shock: -33.9 },
      { name: 'VIX', shock: 285.0 },
      { name: 'HY Spread', shock: 450 },
      { name: 'Oil', shock: -65 },
      { name: 'IG Spread', shock: 180 },
    ],
  },
  'Chip Export Ban': {
    narrative: 'US restrictions on advanced semiconductor exports to China. Targeted impact on chip manufacturing, design, and equipment companies with China revenue exposure.',
    sectors: ['Semiconductors', 'Technology', 'Equipment'],
    factors: [
      { name: 'SOX', shock: -15.2 },
      { name: 'SPX', shock: -4.2 },
      { name: 'VIX', shock: 22.1 },
      { name: 'USD/CNY', shock: 2.1 },
      { name: 'Hang Seng', shock: -8.5 },
    ],
  },
  'Taper Tantrum': {
    narrative: 'Fed signaling end of QE caused sharp rise in Treasury yields. Emerging markets and rate-sensitive assets sold off significantly. Duration-heavy portfolios suffered.',
    sectors: ['Rates', 'Emerging Markets', 'Real Estate', 'Utilities'],
    factors: [
      { name: 'US 10Y', shock: 1.3 },
      { name: 'SPX', shock: -5.6 },
      { name: 'VIX', shock: 38.5 },
      { name: 'EM FX', shock: -8.2 },
      { name: 'MBS Spread', shock: 35 },
    ],
  },
  'Euro Debt Crisis': {
    narrative: 'Sovereign debt crisis in peripheral Europe (Greece, Italy, Spain, Portugal). Contagion fears spread to banking sector. ECB intervention ("whatever it takes") eventually contained crisis.',
    sectors: ['Financials', 'European Sovereign', 'Credit'],
    factors: [
      { name: 'Euro Stoxx', shock: -19.4 },
      { name: 'EUR/USD', shock: -12.0 },
      { name: 'VIX', shock: 115.0 },
      { name: 'IT-DE Spread', shock: 380 },
      { name: 'Bank CDS', shock: 250 },
    ],
  },
};

export function HistoricalAnalogsPage() {
  const [selectedAnalog, setSelectedAnalog] = useState(0);
  const selected = historicalAnalogs[selectedAnalog];
  const detail = analogDetails[selected.name];

  const barData = historicalAnalogs.map(a => ({
    name: a.name.split(' ').slice(0, 2).join(' '),
    overall: Math.round(a.overallScore * 100),
    semantic: Math.round(a.semanticSim * 100),
    structural: Math.round(a.structuralSim * 100),
    market: Math.round(a.marketSim * 100),
  }));

  const radarData = [
    { metric: 'Semantic', value: Math.round(selected.semanticSim * 100) },
    { metric: 'Structural', value: Math.round(selected.structuralSim * 100) },
    { metric: 'Market', value: Math.round(selected.marketSim * 100) },
    { metric: 'Regime', value: Math.round(selected.overallScore * 80) },
    { metric: 'Sector', value: Math.round(selected.structuralSim * 95) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Historical Analog Engine</h2>
          <p className="text-xs text-slate-500 mt-0.5">30+ years macro event database with semantic, structural, and market sensitivity similarity scoring</p>
        </div>
        <span className="text-[10px] text-slate-500">Database: 2,847 events • Last updated: Today</span>
      </div>

      {/* Overall Similarity Chart */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Similarity Score Breakdown — Top 5 Analogs</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#334155' }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#334155' }} tickLine={false} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} />
            <Bar dataKey="semantic" name="Semantic" fill="#06b6d4" opacity={0.6} radius={[2, 2, 0, 0]} />
            <Bar dataKey="structural" name="Structural" fill="#a855f7" opacity={0.6} radius={[2, 2, 0, 0]} />
            <Bar dataKey="market" name="Market" fill="#f59e0b" opacity={0.6} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Analog List */}
        <div className="col-span-5 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Ranked Analogs</h3>
          <div className="space-y-2">
            {historicalAnalogs.map((a, i) => (
              <div
                key={a.name}
                onClick={() => setSelectedAnalog(i)}
                className={cn(
                  'rounded-lg border p-3 transition-colors cursor-pointer',
                  selectedAnalog === i ? 'border-cyan-700 bg-cyan-950/20' : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold',
                      i === 0 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'
                    )}>
                      {i + 1}
                    </span>
                    <div>
                      <span className="text-xs font-medium text-slate-200">{a.name}</span>
                      <span className="ml-2 text-[10px] text-slate-600">{a.date}</span>
                    </div>
                  </div>
                  <span className={cn('text-sm font-bold font-mono', a.overallScore >= 0.8 ? 'text-cyan-400' : a.overallScore >= 0.6 ? 'text-amber-400' : 'text-slate-400')}>
                    {(a.overallScore * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] font-mono">
                  <div>
                    <span className="text-slate-600">Semantic</span>
                    <div className="h-1 mt-1 rounded-full bg-slate-800"><div className="h-full rounded-full bg-cyan-500" style={{ width: `${a.semanticSim * 100}%` }} /></div>
                  </div>
                  <div>
                    <span className="text-slate-600">Structural</span>
                    <div className="h-1 mt-1 rounded-full bg-slate-800"><div className="h-full rounded-full bg-purple-500" style={{ width: `${a.structuralSim * 100}%` }} /></div>
                  </div>
                  <div>
                    <span className="text-slate-600">Market</span>
                    <div className="h-1 mt-1 rounded-full bg-slate-800"><div className="h-full rounded-full bg-amber-500" style={{ width: `${a.marketSim * 100}%` }} /></div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px]">
                  <span className="text-red-400 font-mono">SPX {a.spxShock}%</span>
                  <span className="text-slate-700">|</span>
                  <span className="text-amber-400 font-mono">VIX +{a.vixShock}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Detail */}
        <div className="col-span-7 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-base font-bold text-white">{selected.name}</h4>
                <span className="text-xs text-slate-500">{selected.date}</span>
              </div>
              <span className="text-2xl font-black font-mono text-cyan-400">{(selected.overallScore * 100).toFixed(0)}%</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{detail.narrative}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {detail.sectors.map(s => (
                <span key={s} className="rounded-lg bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] text-slate-300">{s}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Radar */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <h4 className="text-sm font-semibold text-white mb-2">Similarity Profile</h4>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Radar dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Factor Shocks */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <h4 className="text-sm font-semibold text-white mb-3">Historical Factor Shocks</h4>
              <div className="space-y-2">
                {detail.factors.map(f => (
                  <div key={f.name} className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 w-20">{f.name}</span>
                    <div className="flex-1 mx-3 h-2 rounded-full bg-slate-800">
                      <div
                        className={cn('h-full rounded-full', f.shock < 0 ? 'bg-red-500' : f.shock > 50 ? 'bg-amber-500' : 'bg-emerald-500')}
                        style={{ width: `${Math.min(Math.abs(f.shock) / (f.shock > 50 ? 300 : 35) * 100, 100)}%` }}
                      />
                    </div>
                    <span className={cn('text-xs font-mono w-16 text-right', f.shock < 0 ? 'text-red-400' : 'text-amber-400')}>
                      {f.shock > 0 ? '+' : ''}{f.shock}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-cyan-900/30 bg-cyan-950/10 p-5">
            <h4 className="text-xs font-semibold text-cyan-400 uppercase mb-2">Similarity Scoring Methodology</h4>
            <div className="grid grid-cols-3 gap-4 text-[11px] text-slate-400">
              <div>
                <div className="font-semibold text-cyan-400 mb-1">Semantic Similarity</div>
                <p>Embedding distance between event narrative vectors. Uses IBM Watson Discovery embeddings.</p>
              </div>
              <div>
                <div className="font-semibold text-purple-400 mb-1">Structural Similarity</div>
                <p>Sector + geography + regime overlap. Weighted by portfolio exposure concentration.</p>
              </div>
              <div>
                <div className="font-semibold text-amber-400 mb-1">Market Sensitivity</div>
                <p>Historical factor response correlation. How similar the market impact profile is.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
