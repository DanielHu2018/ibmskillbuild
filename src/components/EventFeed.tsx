import { cn } from '@/utils/cn';
import { liveEvents } from '@/data/mockData';
import { AlertCircle, ArrowRight, Globe, Radio, TrendingDown } from 'lucide-react';

const statusColors = {
  new: 'bg-blue-500/20 text-blue-400',
  processing: 'bg-amber-500/20 text-amber-400',
  translated: 'bg-purple-500/20 text-purple-400',
  simulated: 'bg-emerald-500/20 text-emerald-400',
};

const categoryIcons = {
  geopolitical: Globe,
  macro: TrendingDown,
  earnings: TrendingDown,
  policy: AlertCircle,
  commodity: Radio,
  credit: AlertCircle,
};

export function EventFeed() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          <h3 className="text-sm font-semibold text-white">Live Event Intelligence</h3>
        </div>
        <span className="text-[10px] text-slate-500">{liveEvents.length} active events</span>
      </div>
      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {liveEvents.map((event) => {
          const Icon = categoryIcons[event.category];
          return (
            <div
              key={event.id}
              className="group rounded-lg border border-slate-800 bg-slate-950/50 p-3 hover:border-slate-700 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                  event.relevanceScore >= 90 ? 'bg-red-500/15 text-red-400' :
                  event.relevanceScore >= 75 ? 'bg-amber-500/15 text-amber-400' :
                  'bg-slate-700/50 text-slate-400'
                )}>
                  <Icon size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-slate-600">{event.id}</span>
                    <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase', statusColors[event.status])}>
                      {event.status}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-200 leading-relaxed">{event.title}</p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500">
                    <span>{event.source}</span>
                    <span>•</span>
                    <span>{event.timestamp}</span>
                    <span>•</span>
                    <span className={cn(
                      'font-semibold',
                      event.relevanceScore >= 90 ? 'text-red-400' :
                      event.relevanceScore >= 75 ? 'text-amber-400' : 'text-slate-400'
                    )}>
                      REL {event.relevanceScore}%
                    </span>
                    <span>•</span>
                    <span className={event.sentiment < -0.5 ? 'text-red-400' : event.sentiment < 0 ? 'text-amber-400' : 'text-emerald-400'}>
                      SNT {(event.sentiment * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {event.sectors.map((s) => (
                      <span key={s} className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-400">{s}</span>
                    ))}
                  </div>
                </div>
                <ArrowRight size={14} className="mt-1 shrink-0 text-slate-700 group-hover:text-cyan-400 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
