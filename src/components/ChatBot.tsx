/**
 * NARRA — AI Side Panel Chatbot
 * Slides in from the right as a fixed side drawer. Full-height, always accessible.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';
import {
  MessageCircle, X, Send, Loader2, Bot, User,
  Brain, Zap, RefreshCw, ChevronRight, Sparkles,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

import type { AuthSession } from '@/auth/authStore';

interface ChatBotProps {
  session?: AuthSession | null;
  portfolioContext?: {
    totalValue: number;
    totalGainLoss: number;
    gainLossPct: number;
    beta: number;
    holdings: { symbol: string; gainLossPct: number; marketValue: number }[];
    activePortfolioName?: string;
  };
}

// ── Response Engine ──────────────────────────────────────────────────────────
function generateResponse(input: string, ctx?: ChatBotProps['portfolioContext']): string {
  const q = input.toLowerCase().trim();

  if (ctx && (q.includes('portfolio') || q.includes('holding') || q.includes('position'))) {
    if (q.includes('best') || q.includes('top') || q.includes('perform')) {
      const best = [...ctx.holdings].sort((a, b) => b.gainLossPct - a.gainLossPct)[0];
      return `📊 **Best Performer**\n\n**${best?.symbol}** is your top position at **+${best?.gainLossPct.toFixed(1)}%**.\n\nOverall portfolio is **${ctx.gainLossPct >= 0 ? 'up' : 'down'} ${Math.abs(ctx.gainLossPct).toFixed(1)}%** — total value **$${ctx.totalValue.toLocaleString()}**.\n\nPortfolio beta: **${ctx.beta.toFixed(2)}** — ${ctx.beta > 1.3 ? 'above market avg, elevated sensitivity' : ctx.beta > 0.8 ? 'near market average' : 'below market, defensive posture'}.`;
    }
    if (q.includes('worst') || q.includes('loser')) {
      const worst = [...ctx.holdings].sort((a, b) => a.gainLossPct - b.gainLossPct)[0];
      return `📉 **Worst Performer**\n\n**${worst?.symbol}** is your weakest at **${worst?.gainLossPct.toFixed(1)}%**.\n\n**Suggestion:** If this position has broken key support and the investment thesis has changed, consider trimming to reduce drawdown. Check the stop-loss level in your Holdings tab.`;
    }
    if (q.includes('risk') || q.includes('beta')) {
      return `⚠️ **Portfolio Risk**\n\nBeta: **${ctx.beta.toFixed(2)}**\n\n${ctx.beta > 1.5 ? '🔴 **High Risk** — Well above market sensitivity. In Crisis Contagion regime this amplifies losses.' : ctx.beta > 1.1 ? '🟡 **Moderate-High** — Slightly above market. Monitor stop-losses.' : '🟢 **Moderate** — Near market average.'}\n\nP&L: **${ctx.totalGainLoss >= 0 ? '+' : ''}$${ctx.totalGainLoss.toLocaleString('en-US', { maximumFractionDigits: 0 })}** (${ctx.gainLossPct >= 0 ? '+' : ''}${ctx.gainLossPct.toFixed(1)}%)`;
    }
    if (q.includes('value') || q.includes('worth') || q.includes('total')) {
      return `💼 **Portfolio Summary**\n\n• Value: **$${ctx.totalValue.toLocaleString()}**\n• Gain/Loss: **${ctx.totalGainLoss >= 0 ? '+' : ''}$${ctx.totalGainLoss.toLocaleString('en-US', { maximumFractionDigits: 0 })}**\n• Return: **${ctx.gainLossPct >= 0 ? '+' : ''}${ctx.gainLossPct.toFixed(1)}%**\n• Positions: **${ctx.holdings.length}**\n• Beta: **${ctx.beta.toFixed(2)}**`;
    }
  }

  if (q.includes('vix') || q.includes('volatility')) {
    return `📊 **VIX / Volatility**\n\nNARRA Regime: **Crisis Contagion** · Multiplier **1.85×**\n\nIn VIX spike environments:\n• Correlations converge → 1\n• Tail risk increases non-linearly\n• Bid-ask spreads widen\n• Options premiums inflate 30-50%\n\n**Recommendation:** Reduce beta, increase cash, consider put spreads on broad indices.`;
  }

  if (q.includes('fed') || q.includes('rate') || q.includes('fomc')) {
    return `🏛️ **Fed / Rates**\n\nHigher-for-longer implications:\n• **Growth stocks** — multiple compression\n• **Financials** — NIM expansion benefit\n• **Utilities/REITs** — yield competition headwind\n• **Tech** — underperforms early, recovers later\n\nWatch for pivot language — creates asymmetric upside for long-duration assets.`;
  }

  if (q.includes('inflation') || q.includes('cpi')) {
    return `📈 **Inflation Risk**\n\n• **Commodities** — natural hedge ✓\n• **TIPS** — preferred in inflationary regimes ✓\n• **Tech** — pricing power helps but DCF hurt\n• **Long bonds** — most vulnerable\n\nNARRA applies **Inflation Shock Regime** multiplier when CPI > 4%.`;
  }

  if (q.includes('recession') || q.includes('crash') || q.includes('downturn')) {
    return `⚠️ **Recession Scenario**\n\nNARRA parameters:\n• Equity drawdown: **-25% to -45%**\n• HY spread widening: **+300-600bps**\n• VIX range: **35–65**\n• All assets → correlation 1.0\n\n**Defensive playbook:**\n1. Raise cash 15–20%\n2. Rotate to Quality factor\n3. Buy puts on high-beta\n4. Add gold/treasuries\n5. Tighten all stop-losses`;
  }

  const stocks: Record<string, string> = {
    nvda: `🟢 **NVIDIA (NVDA)**\n\nAI infrastructure supercycle, innings 2–3. Blackwell demand accelerating.\n\n• Target: **$175–195**\n• Risk: Export restrictions, AI capex slowdown\n• Beta: **1.98** (high)\n• Rec: **Strong Buy** on dips to $110–120\n• Stop: ~$95–100`,
    aapl: `🟢 **Apple (AAPL)**\n\nServices flywheel + Apple Intelligence replacement cycle.\n\n• Target: **$230–250**\n• Risk: China revenue, regulatory DMA\n• Beta: **1.24**\n• Rec: **Hold / Add** < $180\n• Stop: ~$170`,
    msft: `🟢 **Microsoft (MSFT)**\n\nAzure AI Copilot monetization accelerating. Office 365 moat.\n\n• Target: **$480–510**\n• Risk: Antitrust, AI competition\n• Beta: **0.90** (defensive)\n• Rec: **Strong Hold / Buy** on dips\n• Stop: ~$390`,
    tsla: `🔴 **Tesla (TSLA)**\n\nMargin compression, Chinese EV competition intensifying.\n\n• Target: **$220–280** (wide range)\n• Risk: Volume slowdown, Musk distraction\n• Beta: **2.30** (very high)\n• Rec: **Reduce** on rallies > $280\n• Stop: ~$200`,
    meta: `🟢 **Meta (META)**\n\nAd re-acceleration from AI targeting. Llama AI strategic moat.\n\n• Target: **$580–620**\n• Risk: EU regulatory fines, ad cyclicality\n• Beta: **1.42**\n• Rec: **Buy / Strong Hold**\n• Stop: ~$440`,
    googl: `🟢 **Alphabet (GOOGL)**\n\nSearch dominance + Gemini monetization. YouTube ad recovery.\n\n• Target: **$185–210**\n• Risk: AI search disruption, antitrust\n• Beta: **1.05**\n• Rec: **Buy**\n• Stop: ~$155`,
    amzn: `🟢 **Amazon (AMZN)**\n\nAWS re-acceleration + advertising growth. Margin expansion story.\n\n• Target: **$230–260**\n• Risk: AWS growth decel, consumer slowdown\n• Beta: **1.15**\n• Rec: **Buy**\n• Stop: ~$175`,
  };

  for (const [key, resp] of Object.entries(stocks)) {
    if (q.includes(key)) return resp;
  }

  if (q.includes('regime') || q.includes('crisis')) {
    return `🔍 **Current Regime: Crisis Contagion**\n\nBased on:\n• VIX Percentile: **78th**\n• MOVE Index: **72nd**\n• Credit Spreads: **+48bps**\n• Correlation Cluster: **0.82**\n\nShock multiplier: **1.85×**\n• Correlation matrix → 1.0\n• Hedge costs +35%\n• Bid-ask spreads +18%`;
  }

  if (q.includes('hedge') || q.includes('protect')) {
    return `🛡️ **Hedge Recommendations**\n\n1. **SPY Puts** (5% OTM, 1m) — $2,400, 78% tail coverage\n2. **VIX Calls** (25-strike) — $890, spike protection\n3. **GLD** (3–5%) — inflation + crisis hedge\n4. **Short-duration Treasuries** — reduce duration\n5. **Utilities rotation** — lower beta exposure\n\nTotal cost: ~1.2–1.8% for 65–80% tail coverage.`;
  }

  if (q.includes('var') || q.includes('value at risk')) {
    return `📊 **VaR / Expected Shortfall**\n\n• **VaR 95%:** Won't exceed in 19/20 days\n• **VaR 99%:** Won't exceed in 99/100 days\n• **ES (CVaR):** Avg loss in worst 1% of scenarios\n\nNARRA uses 100K Monte Carlo paths with regime-conditioned covariance (1.85× multiplier, stressed correlations).\n\nGo to **Portfolio Risk → Monte Carlo** for your simulation.`;
  }

  if (q.includes('buy') || q.includes('recommend') || q.includes('top stocks')) {
    return `🎯 **Top Buy Ideas**\n\n1. **NVDA** — AI supercycle, +28% target\n2. **AVGO** — Custom ASIC + VMware, +22%\n3. **GOOGL** — Search + Gemini, +24%\n4. **LLY** — GLP-1 TAM, +31%\n5. **META** — Ad re-acceleration, +19%\n\nSee **Portfolio Risk → Top Buy Ideas** for detailed theses.\n\n*Not financial advice. DYOR.*`;
  }

  if (q.includes('help') || q === 'hi' || q === 'hello' || q === 'hey' || q === '') {
    return `👋 **Hello! I'm NARRA AI.**\n\nI help you analyze risk, markets, and your portfolio.\n\n**Try asking:**\n• "How is my portfolio doing?"\n• "Analyze NVDA"\n• "What's the current regime?"\n• "Best hedge right now?"\n• "Explain VaR"\n• "Top stocks to buy?"\n• "Recession scenario"\n\nJust type naturally — I understand financial context!`;
  }

  return `I understand you're asking about **"${input}"**.\n\nIn the current **Crisis Contagion** regime, all risk factors are amplified **1.85×**. NARRA monitors events, translates narratives to factor shocks, and simulates portfolio impact in real time.\n\nTry asking me about:\n• A specific stock (e.g., "Analyze AAPL")\n• Your portfolio ("How am I doing?")\n• Market conditions ("Current regime?")\n• Risk concepts ("Explain VaR")`;
}

// ── Message formatter ────────────────────────────────────────────────────────
function formatMessage(text: string) {
  return text.split('\n').map((line, i) => {
    const html = line.replace(/\*\*(.+?)\*\*/g, (_, m) => `<strong class="text-white">${m}</strong>`);
    if (line.startsWith('•') || line.startsWith('*')) {
      return (
        <div key={i} className="flex gap-2 leading-relaxed">
          <span className="text-cyan-500 shrink-0">•</span>
          <span dangerouslySetInnerHTML={{ __html: html.replace(/^[•*]\s*/, '') }} />
        </div>
      );
    }
    if (line === '') return <div key={i} className="h-1.5" />;
    return <div key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

const QUICK_PROMPTS = [
  'How is my portfolio?',
  'Analyze NVDA',
  'Current regime?',
  'Best hedge?',
  'Top stocks to buy?',
  'Explain VaR',
  'Recession scenario',
  'Inflation risk',
];

// ── ChatBot Side Panel ───────────────────────────────────────────────────────
export function ChatBot({ portfolioContext, session: _session }: ChatBotProps) {
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread]   = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 **Hello! I'm NARRA AI.**\n\nI'm your institutional risk intelligence assistant. Ask me about your portfolio, market regimes, specific stocks, or risk concepts.\n\nType **"help"** to see everything I can do.`,
      timestamp: new Date(),
    },
  ]);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open, messages]);

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput('');

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    await new Promise(r => setTimeout(r, 500 + Math.random() * 700));

    const aiMsg: Message = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: generateResponse(content, portfolioContext),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
    if (!open) setUnread(n => n + 1);
  }, [input, loading, portfolioContext, open]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* ── Toggle button (always visible on right edge) ── */}
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center justify-center gap-1.5',
          'h-28 w-9 rounded-l-2xl border-l border-t border-b transition-all duration-300 shadow-xl',
          open
            ? 'border-cyan-700/50 bg-cyan-950/80 text-cyan-300'
            : 'border-slate-700 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
        )}
      >
        {open ? (
          <ChevronRight size={15} />
        ) : (
          <>
            <MessageCircle size={15} />
            {unread > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white">
                {unread}
              </span>
            )}
          </>
        )}
        <span className="text-[8px] font-bold uppercase tracking-widest" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
          AI
        </span>
      </button>

      {/* ── Side Drawer ── */}
      <div className={cn(
        'fixed right-0 top-0 bottom-0 z-30 flex flex-col border-l border-slate-800 bg-slate-950 shadow-2xl shadow-black/60 transition-all duration-300',
        open ? 'w-[380px]' : 'w-0 overflow-hidden'
      )}>
        {open && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
                  <Brain size={14} className="text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    NARRA AI
                    <Sparkles size={10} className="text-cyan-400" />
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-slate-500">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online · Crisis Contagion Regime
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMessages(msgs => [msgs[0]])}
                  className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-800 hover:text-slate-400 transition-colors"
                  title="Clear chat"
                >
                  <RefreshCw size={11} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-800 hover:text-red-400 transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Portfolio context banner */}
            {portfolioContext && (
              <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/60 px-4 py-1.5 shrink-0">
                <Zap size={9} className="text-cyan-400" />
                <span className="text-[9px] text-slate-500">
                  Portfolio loaded · ${portfolioContext.totalValue.toLocaleString()} · β={portfolioContext.beta.toFixed(2)} · {portfolioContext.holdings.length} positions
                </span>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={cn('flex gap-2.5', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                  <div className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs',
                    msg.role === 'user'
                      ? 'bg-cyan-600'
                      : 'bg-gradient-to-br from-cyan-900 to-blue-900 border border-cyan-800/40'
                  )}>
                    {msg.role === 'user' ? <User size={12} className="text-white" /> : <Bot size={12} className="text-cyan-300" />}
                  </div>
                  <div className={cn(
                    'max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[11px] space-y-0.5',
                    msg.role === 'user'
                      ? 'bg-cyan-700/40 border border-cyan-700/30 rounded-tr-sm text-white'
                      : 'bg-slate-800/80 border border-slate-700/50 rounded-tl-sm text-slate-300'
                  )}>
                    {msg.role === 'assistant'
                      ? <div className="space-y-0.5">{formatMessage(msg.content)}</div>
                      : <div>{msg.content}</div>
                    }
                    <div className="text-[9px] text-slate-600 mt-1.5 pt-1 border-t border-slate-700/30">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-900 to-blue-900 border border-cyan-800/40">
                    <Bot size={12} className="text-cyan-300" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-slate-800/80 border border-slate-700/50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 size={11} className="animate-spin text-cyan-400" />
                      <span className="text-[10px] text-slate-500">NARRA is analyzing…</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            <div className="border-t border-slate-800/60 px-4 pt-2 pb-1 shrink-0">
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {QUICK_PROMPTS.map(p => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="shrink-0 rounded-full border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-[10px] text-slate-400 hover:border-cyan-700 hover:text-cyan-300 hover:bg-cyan-950/30 transition-all whitespace-nowrap"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-slate-800 p-3 shrink-0">
              <div className="flex items-end gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 focus-within:border-cyan-600 transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask NARRA anything…"
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none leading-relaxed max-h-20"
                  style={{ overflowY: input.split('\n').length > 3 ? 'auto' : 'hidden' }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <Send size={12} className="text-white" />
                </button>
              </div>
              <div className="text-[9px] text-slate-700 mt-1.5 text-center">
                Enter to send · Shift+Enter for newline
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
