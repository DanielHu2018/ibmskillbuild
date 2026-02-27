/**
 * NARRA — Header
 * Working Export dropdown, Run Cycle modal, Settings modal, Alerts bell drawer.
 */
import { useState, useRef, useEffect } from 'react';
import {
  Bell, Clock, RefreshCw, Settings, Download,
  FileJson, FileText, FileCode2, X, AlertTriangle,
  XCircle, CheckCircle, Info,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { systemMetrics, portfolioImpact, liveEvents } from '@/data/mockData';
import { exportJSON, exportCSV, exportHTMLReport } from '@/services/exportService';
import { RunCycleModal } from '@/components/RunCycleModal';
import { SettingsModal } from '@/components/SettingsModal';
import type { AuthSession } from '@/auth/authStore';

export interface HeaderProps {
  activeTab: string;
  session?: AuthSession | null;
  onSignOut?: () => void;
}

// ── Alerts Drawer ─────────────────────────────────────────────────────────────
const HEADER_ALERTS = [
  { id: 'a1', sev: 'critical' as const, title: 'VaR 95% Limit Breach',       detail: '1-Day VaR $28.7M exceeds $25M limit',       time: '14:32:44' },
  { id: 'a2', sev: 'critical' as const, title: 'Expected Shortfall Breach',   detail: 'ES $45.3M exceeds $40M limit (+13.3%)',      time: '14:32:44' },
  { id: 'a3', sev: 'critical' as const, title: 'Tail Loss Probability Breach',detail: 'P(loss>3σ) = 8.4%, limit 5.0%',              time: '14:32:45' },
  { id: 'a4', sev: 'critical' as const, title: 'VaR 99% Limit Breach',        detail: '10-Day VaR 99% $72.1M exceeds $65M limit',  time: '14:32:44' },
  { id: 'a5', sev: 'warning' as const, title: 'Regime Transition',            detail: 'Tightening Cycle → Crisis Contagion (1.85×)', time: '14:32:25' },
  { id: 'a6', sev: 'warning' as const, title: 'Event Compounding Detected',   detail: 'EVT-001 + EVT-003 nonlinear amplification',  time: '14:32:18' },
  { id: 'a7', sev: 'info'    as const, title: 'Hedge Coverage Below Target',  detail: '68% coverage — target 80%',                  time: '14:33:01' },
  { id: 'a8', sev: 'info'    as const, title: 'Correlation Stress Active',    detail: 'Cross-asset correlation shift +0.15',         time: '14:32:30' },
];

const sevCfg = {
  critical: { icon: XCircle,       iconCls: 'text-red-400',    rowCls: 'border-red-900/40 bg-red-950/20',    badge: 'bg-red-500/20 text-red-400' },
  warning:  { icon: AlertTriangle, iconCls: 'text-amber-400',  rowCls: 'border-amber-900/30 bg-amber-950/10', badge: 'bg-amber-500/20 text-amber-400' },
  info:     { icon: Info,          iconCls: 'text-blue-400',   rowCls: 'border-blue-900/30 bg-blue-950/10',  badge: 'bg-blue-500/20 text-blue-400' },
};

function AlertsDrawer({ onClose, onGoAlerts }: { onClose: () => void; onGoAlerts: () => void }) {
  const [acked, setAcked] = useState<Set<string>>(new Set());
  const unacked = HEADER_ALERTS.filter(a => !acked.has(a.id)).length;

  return (
    <div className="absolute right-0 top-full mt-2 z-50 w-[400px] rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl shadow-black/60 overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-red-600 via-amber-500 to-blue-600" />
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-white" />
          <span className="text-sm font-bold text-white">Active Alerts</span>
          {unacked > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
              {unacked}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onGoAlerts}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
          >
            View All →
          </button>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Breach summary */}
      <div className="grid grid-cols-3 gap-2 p-4 border-b border-slate-800">
        {[
          { label: 'Critical', count: HEADER_ALERTS.filter(a => a.sev === 'critical').length, cls: 'text-red-400' },
          { label: 'Warning',  count: HEADER_ALERTS.filter(a => a.sev === 'warning').length,  cls: 'text-amber-400' },
          { label: 'Info',     count: HEADER_ALERTS.filter(a => a.sev === 'info').length,     cls: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-center">
            <div className="text-[10px] text-slate-500">{s.label}</div>
            <div className={cn('text-xl font-bold font-mono', s.cls)}>{s.count}</div>
          </div>
        ))}
      </div>

      {/* Alert list */}
      <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/50">
        {HEADER_ALERTS.map(alert => {
          const cfg = sevCfg[alert.sev];
          const Icon = cfg.icon;
          const isAcked = acked.has(alert.id);
          return (
            <div key={alert.id} className={cn('flex items-start gap-3 px-4 py-3 transition-all', isAcked && 'opacity-40')}>
              <Icon size={14} className={cn('mt-0.5 shrink-0', cfg.iconCls)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={cn('text-[9px] font-bold uppercase rounded-full px-1.5 py-0.5', cfg.badge)}>
                    {alert.sev}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{alert.time}</span>
                </div>
                <div className="text-xs font-semibold text-white leading-tight">{alert.title}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{alert.detail}</div>
              </div>
              {!isAcked && (
                <button
                  onClick={() => setAcked(prev => new Set([...prev, alert.id]))}
                  className="shrink-0 rounded-lg border border-slate-700 hover:border-emerald-700 bg-slate-800 hover:bg-emerald-950/30 px-2 py-1 text-[9px] text-slate-400 hover:text-emerald-300 transition-all flex items-center gap-1"
                >
                  <CheckCircle size={9} /> ACK
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between">
        <span className="text-[10px] text-slate-600">
          {portfolioImpact.filter(p => p.breached).length} limit breaches · {liveEvents.length} events monitored
        </span>
        <button
          onClick={() => setAcked(new Set(HEADER_ALERTS.map(a => a.id)))}
          className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
        >
          Acknowledge All
        </button>
      </div>
    </div>
  );
}

// ── Export Dropdown ──────────────────────────────────────────────────────────
function ExportDropdown({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute right-0 top-full mt-2 z-50 w-52 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/60 overflow-hidden">
      <div className="p-2 space-y-0.5">
        <button
          onClick={() => { exportJSON(); onClose(); }}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left"
        >
          <FileJson size={14} className="text-cyan-400" />
          <div>
            <div className="font-semibold">Export JSON</div>
            <div className="text-[10px] text-slate-500">Full risk data package</div>
          </div>
        </button>
        <button
          onClick={() => { exportCSV(); onClose(); }}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left"
        >
          <FileText size={14} className="text-emerald-400" />
          <div>
            <div className="font-semibold">Export CSV</div>
            <div className="text-[10px] text-slate-500">Shock matrix + impact table</div>
          </div>
        </button>
        <button
          onClick={() => { exportHTMLReport(); onClose(); }}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left"
        >
          <FileCode2 size={14} className="text-purple-400" />
          <div>
            <div className="font-semibold">Export HTML Report</div>
            <div className="text-[10px] text-slate-500">CIO-ready printable report</div>
          </div>
        </button>
      </div>
      <div className="border-t border-slate-800 px-3 py-2">
        <p className="text-[9px] text-slate-600 leading-relaxed">
          All exports include full governance metadata and are SR 11-7 compliant.
        </p>
      </div>
    </div>
  );
}

// ── Main Header ──────────────────────────────────────────────────────────────
export function Header({ activeTab, session: _session, onSignOut: _onSignOut }: HeaderProps) {
  const [showExport,   setShowExport]   = useState(false);
  const [showAlerts,   setShowAlerts]   = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCycle,    setShowCycle]    = useState(false);

  const exportRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setShowExport(false);
      if (alertsRef.current && !alertsRef.current.contains(e.target as Node)) setShowAlerts(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unackedCount = HEADER_ALERTS.filter(a => a.sev === 'critical').length;

  return (
    <>
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-950 shrink-0">
        {/* Left */}
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-bold text-white tracking-tight">{activeTab}</h1>
          <div className="hidden lg:flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Clock size={13} />
              <span>Last cycle: <span className="text-cyan-400 font-mono">{systemMetrics.lastCycleTime}</span></span>
            </div>
            <div className="h-3 w-px bg-slate-800" />
            <span>Events: <span className="text-white font-mono">{systemMetrics.eventsProcessed.toLocaleString()}</span></span>
            <div className="h-3 w-px bg-slate-800" />
            <span>Latency: <span className="text-emerald-400 font-mono">{systemMetrics.avgLatency}</span></span>
            <div className="h-3 w-px bg-slate-800" />
            <span>Uptime: <span className="text-emerald-400 font-mono">{systemMetrics.uptime}</span></span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">

          {/* Export dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => { setShowExport(v => !v); setShowAlerts(false); }}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors cursor-pointer',
                showExport
                  ? 'border-cyan-700 bg-cyan-950/40 text-cyan-300'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
              )}
            >
              <Download size={13} />
              Export
            </button>
            {showExport && <ExportDropdown onClose={() => setShowExport(false)} />}
          </div>

          {/* Run Cycle */}
          <button
            onClick={() => setShowCycle(true)}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-800 bg-cyan-950/50 px-3 py-1.5 text-xs text-cyan-400 hover:bg-cyan-900/50 transition-colors cursor-pointer"
          >
            <RefreshCw size={13} className={showCycle ? 'animate-spin' : ''} />
            Run Cycle
          </button>

          {/* Bell / Alerts */}
          <div className="relative" ref={alertsRef}>
            <button
              onClick={() => { setShowAlerts(v => !v); setShowExport(false); }}
              className={cn(
                'relative rounded-lg p-2 transition-colors cursor-pointer',
                showAlerts ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Bell size={16} />
              {unackedCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white animate-pulse">
                  {unackedCount}
                </span>
              )}
            </button>
            {showAlerts && (
              <AlertsDrawer
                onClose={() => setShowAlerts(false)}
                onGoAlerts={() => setShowAlerts(false)}
              />
            )}
          </div>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Modals */}
      {showCycle    && <RunCycleModal  onClose={() => setShowCycle(false)} />}
      {showSettings && <SettingsModal  onClose={() => setShowSettings(false)} />}
    </>
  );
}
