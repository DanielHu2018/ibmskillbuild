import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { LiveNewsTicker } from '@/components/LiveNewsTicker';
import { ChatBot } from '@/components/ChatBot';
import { AuthPage } from '@/auth/AuthPage';
import { CommandCenter } from '@/pages/CommandCenter';
import { LiveMarketsPage } from '@/pages/LiveMarketsPage';
import { EventFeedPage } from '@/pages/EventFeedPage';
import { ShockMatrixPage } from '@/pages/ShockMatrixPage';
import { PortfolioRiskPage } from '@/pages/PortfolioRiskPage';
import { HedgeEnginePage } from '@/pages/HedgeEnginePage';
import { RegimeAnalysisPage } from '@/pages/RegimeAnalysisPage';
import { HistoricalAnalogsPage } from '@/pages/HistoricalAnalogsPage';
import { SimulationPage } from '@/pages/SimulationPage';
import { AlertsPage } from '@/pages/AlertsPage';
import { AuditTrailPage } from '@/pages/AuditTrailPage';
import { SystemHealthPage } from '@/pages/SystemHealthPage';
import { getCurrentSession, signOut, type AuthSession } from '@/auth/authStore';

const tabComponents: Record<string, React.ComponentType<{ setActiveTab?: (tab: string) => void }>> = {
  'Live Markets':       LiveMarketsPage,
  'Event Feed':         EventFeedPage,
  'Shock Matrix':       ShockMatrixPage,
  'Hedge Engine':       HedgeEnginePage,
  'Regime Analysis':    RegimeAnalysisPage,
  'Historical Analogs': HistoricalAnalogsPage,
  'Simulation':         SimulationPage,
  'Alerts':             AlertsPage,
  'Audit Trail':        AuditTrailPage,
  'System Health':      SystemHealthPage,
};

export function App() {
  const [session, setSession] = useState<AuthSession | null>(() => getCurrentSession());
  const [activeTab, setActiveTab] = useState('Command Center');

  // Re-check session on mount
  useEffect(() => {
    setSession(getCurrentSession());
  }, []);

  const handleAuth = () => {
    setSession(getCurrentSession());
  };

  const handleSignOut = () => {
    signOut();
    setSession(null);
    setActiveTab('Command Center');
  };

  // Not authenticated — show auth page
  if (!session) {
    return <AuthPage onAuth={handleAuth} />;
  }

  const PageComponent = tabComponents[activeTab];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-white">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} session={session} onSignOut={handleSignOut} />

      {/* ── Main column ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">

        {/* ══ LIVE TICKER (stocks + news) ══════════════════════════════════════ */}
        <LiveNewsTicker />

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <Header activeTab={activeTab} session={session} onSignOut={handleSignOut} />

        {/* ── Scrollable page content ───────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-5 space-y-4 pr-16">
          {activeTab === 'Command Center' ? (
            <CommandCenter setActiveTab={setActiveTab} />
          ) : activeTab === 'Portfolio Risk' ? (
            <PortfolioRiskPage userId={session.userId} userName={session.name} />
          ) : PageComponent ? (
            <PageComponent setActiveTab={setActiveTab} />
          ) : (
            <div className="flex h-96 items-center justify-center">
              <p className="text-slate-600">Tab not found</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/30 px-5 py-3">
            <div className="flex items-center gap-4 text-[10px] text-slate-600">
              <span>NARRA v2.4.1</span>
              <span>•</span>
              <span>IBM watsonx Granite</span>
              <span>•</span>
              <span>SR 11-7 Compliant</span>
              <span>•</span>
              <span>Model Governance: Active</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-slate-600">
              <span>
                Logged in as{' '}
                <span className="text-cyan-400 font-semibold">{session.name}</span>
              </span>
              <span>•</span>
              <span className="text-amber-500 font-semibold">CONFIDENTIAL</span>
            </div>
          </div>
        </main>
      </div>

      {/* ── AI Chat Side Panel ─────────────────────────────────────────────── */}
      <ChatBot session={session} />
    </div>
  );
}
