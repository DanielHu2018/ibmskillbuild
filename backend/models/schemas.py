"""
CLARA — Pydantic Data Models / Schemas
All request/response shapes for the API.
"""

from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ══════════════════════════════════════════════════════════════════════════════
# ENUMS
# ══════════════════════════════════════════════════════════════════════════════

class AlertType(str, Enum):
    SELL_TARGET_HIT   = "SELL_TARGET_HIT"
    STOP_LOSS_HIT     = "STOP_LOSS_HIT"
    TRAILING_STOP_HIT = "TRAILING_STOP_HIT"
    BULL_TARGET_HIT   = "BULL_TARGET_HIT"
    DAILY_SUMMARY     = "DAILY_SUMMARY"


class AlertSeverity(str, Enum):
    INFO     = "info"
    WARNING  = "warning"
    CRITICAL = "critical"
    SUCCESS  = "success"


class RegimeType(str, Enum):
    LOW_VOL_EXPANSION   = "Low Vol Expansion"
    TIGHTENING_CYCLE    = "Tightening Cycle"
    CRISIS_CONTAGION    = "Crisis Contagion"
    LIQUIDITY_CONTRACTION = "Liquidity Contraction"
    INFLATION_SHOCK     = "Inflation Shock Regime"


class RiskLevel(str, Enum):
    LOW       = "Low"
    MEDIUM    = "Medium"
    HIGH      = "High"
    VERY_HIGH = "Very High"


class EmailProvider(str, Enum):
    SENDGRID = "sendgrid"
    SMTP     = "smtp"
    EMAILJS  = "emailjs"


# ══════════════════════════════════════════════════════════════════════════════
# STOCK / MARKET DATA
# ══════════════════════════════════════════════════════════════════════════════

class StockQuote(BaseModel):
    symbol: str
    company: str
    price: float
    change: float
    change_pct: float
    open: float
    high: float
    low: float
    volume: int
    prev_close: float
    market_cap: Optional[str] = None
    pe_ratio: Optional[float] = None
    week_high_52: Optional[float] = None
    week_low_52: Optional[float] = None
    beta: Optional[float] = None
    dividend_yield: Optional[float] = None
    eps: Optional[float] = None
    analyst_target: Optional[float] = None
    sector: Optional[str] = None
    last_updated: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    data_source: str = "simulated"


class PriceBar(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class MarketIndex(BaseModel):
    name: str
    symbol: str
    value: float
    change: float
    change_pct: float


class StockQuoteRequest(BaseModel):
    symbols: List[str] = Field(..., min_items=1, max_items=50)


class StockHistoryRequest(BaseModel):
    symbol: str
    interval: str = "daily"   # daily | 60min | 15min | 5min
    outputsize: str = "compact"  # compact (100 bars) | full (20y)


class NewsItem(BaseModel):
    title: str
    url: str
    source: str
    published: str
    summary: str
    sentiment_score: float = 0.0
    sentiment_label: str = "Neutral"
    tickers: List[str] = []


# ══════════════════════════════════════════════════════════════════════════════
# PORTFOLIO
# ══════════════════════════════════════════════════════════════════════════════

class PortfolioPosition(BaseModel):
    id: str
    symbol: str
    company: str
    shares: float = Field(..., gt=0)
    avg_cost: float = Field(..., gt=0)
    note: Optional[str] = None
    sector: Optional[str] = None
    added_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class AddPositionRequest(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=10)
    shares: float = Field(..., gt=0)
    avg_cost: float = Field(..., gt=0)
    note: Optional[str] = None

    @validator("symbol")
    def symbol_uppercase(cls, v: str) -> str:
        return v.upper().strip()


class UpdatePositionRequest(BaseModel):
    shares: Optional[float] = Field(None, gt=0)
    avg_cost: Optional[float] = Field(None, gt=0)
    note: Optional[str] = None


class EnrichedPosition(BaseModel):
    """Position enriched with live price data and computed analytics."""
    id: str
    symbol: str
    company: str
    shares: float
    avg_cost: float
    note: Optional[str] = None
    sector: str = "Unknown"
    current_price: float
    change: float
    change_pct: float
    market_value: float
    cost_basis: float
    gain_loss: float
    gain_loss_pct: float
    day_gain_loss: float

    # Price targets (AI-computed)
    sell_target: float
    stop_loss: float
    trailing_stop: float
    bull_target: float
    conservative_target: float

    # Risk
    beta: float = 1.0
    risk_level: RiskLevel
    action: str  # "Strong Hold" | "Hold" | "Reduce" | "Sell"

    # Stats
    week_high_52: Optional[float] = None
    week_low_52: Optional[float] = None
    pe_ratio: Optional[float] = None
    analyst_target: Optional[float] = None
    weight: float = 0.0

    data_source: str = "simulated"


class PortfolioSummary(BaseModel):
    total_value: float
    cost_basis: float
    total_gain_loss: float
    total_gain_loss_pct: float
    day_gain_loss: float
    portfolio_beta: float
    positions_count: int
    var_1d_95: float
    expected_shortfall: float
    sharpe_ratio: Optional[float] = None


class BuyRecommendation(BaseModel):
    symbol: str
    company: str
    sector: str
    current_price: float
    target_price: float
    upside_pct: float
    entry_price: float          # recommended buy price
    stop_loss: float
    pe_ratio: Optional[float] = None
    beta: float
    rating: str                 # "Strong Buy" | "Buy" | "Hold"
    thesis: str
    catalysts: List[str]
    risks: List[str]
    time_horizon: str           # "3-6 months" | "6-12 months" | "12-24 months"
    conviction: int             # 1-10


# ══════════════════════════════════════════════════════════════════════════════
# ALERT AGENT
# ══════════════════════════════════════════════════════════════════════════════

class AlertConfig(BaseModel):
    user_email: str = ""
    enabled: bool = False
    check_interval_seconds: int = 30
    alert_on_sell_target: bool = True
    alert_on_stop_loss: bool = True
    alert_on_trailing_stop: bool = True
    alert_on_bull_target: bool = False
    send_daily_summary: bool = False
    daily_summary_time: str = "16:00"
    email_provider: EmailProvider = EmailProvider.SMTP


class InAppAlert(BaseModel):
    id: str
    timestamp: datetime
    alert_type: AlertType
    symbol: str
    company: str
    message: str
    trigger_price: float
    current_price: float
    severity: AlertSeverity
    acknowledged: bool = False
    email_sent: bool = False


class AlertLogEntry(BaseModel):
    id: str
    timestamp: datetime
    alert_type: AlertType
    symbol: str
    to_email: str
    trigger_price: float
    current_price: float
    sent: bool
    error: Optional[str] = None
    provider_used: str = "none"


class SendTestAlertRequest(BaseModel):
    symbol: str
    alert_type: AlertType = AlertType.SELL_TARGET_HIT


class UpdateAlertConfigRequest(BaseModel):
    user_email: Optional[str] = None
    enabled: Optional[bool] = None
    check_interval_seconds: Optional[int] = None
    alert_on_sell_target: Optional[bool] = None
    alert_on_stop_loss: Optional[bool] = None
    alert_on_trailing_stop: Optional[bool] = None
    alert_on_bull_target: Optional[bool] = None
    send_daily_summary: Optional[bool] = None
    email_provider: Optional[EmailProvider] = None


# ══════════════════════════════════════════════════════════════════════════════
# RISK ENGINE
# ══════════════════════════════════════════════════════════════════════════════

class VaRResult(BaseModel):
    var_1d_95: float
    var_1d_99: float
    var_10d_95: float
    var_10d_99: float
    expected_shortfall_95: float
    expected_shortfall_99: float
    tail_loss_probability: float
    breach_probability: float
    limit_var: float = 1_000_000.0
    intraday_history: List[Dict[str, Any]] = []


class RiskContributor(BaseModel):
    symbol: str
    company: str
    marginal_var: float
    component_var: float
    pct_of_total: float
    beta: float


class StressTestResult(BaseModel):
    scenario: str
    impact_pct: float
    impact_dollars: float
    var_change: float
    breach: bool


class MonteCarloResult(BaseModel):
    paths: int
    mean_return: float
    std_dev: float
    var_95: float
    var_99: float
    expected_shortfall: float
    max_loss: float
    max_gain: float
    histogram: List[Dict[str, Any]]
    convergence: List[Dict[str, Any]]


# ══════════════════════════════════════════════════════════════════════════════
# REGIME ENGINE
# ══════════════════════════════════════════════════════════════════════════════

class RegimeIndicators(BaseModel):
    vix: float
    vix_percentile: float
    move_index: float
    move_percentile: float
    credit_spread_ig: float
    credit_spread_hy: float
    liquidity_score: float
    correlation_clustering: float
    shock_multiplier: float


class RegimeClassification(BaseModel):
    regime: RegimeType
    confidence: float
    indicators: RegimeIndicators
    description: str
    recommended_actions: List[str]
    historical_analogs: List[str]


# ══════════════════════════════════════════════════════════════════════════════
# HEDGE ENGINE
# ══════════════════════════════════════════════════════════════════════════════

class HedgeProposal(BaseModel):
    id: str
    instrument: str
    instrument_type: str        # "Index Future" | "Put Option" | "ETF" | etc.
    symbol: str
    notional: float
    cost: float
    cost_pct: float
    effectiveness_pct: float
    residual_tail_exposure: float
    priority: str               # "Critical" | "High" | "Medium"
    rationale: str
    greeks: Optional[Dict[str, float]] = None


# ══════════════════════════════════════════════════════════════════════════════
# AUDIT
# ══════════════════════════════════════════════════════════════════════════════

class AuditEntry(BaseModel):
    id: str
    timestamp: datetime
    event_type: str
    component: str
    description: str
    inputs: Dict[str, Any] = {}
    outputs: Dict[str, Any] = {}
    confidence: Optional[float] = None
    user: str = "system"
    sr_11_7_compliant: bool = True


# ══════════════════════════════════════════════════════════════════════════════
# SYSTEM HEALTH
# ══════════════════════════════════════════════════════════════════════════════

class ServiceStatus(BaseModel):
    name: str
    status: str                 # "operational" | "degraded" | "down"
    latency_ms: Optional[float] = None
    last_checked: datetime
    error: Optional[str] = None


class SystemHealthResponse(BaseModel):
    overall: str
    uptime_seconds: float
    services: List[ServiceStatus]
    alert_agent: str
    positions_monitored: int
    alerts_today: int
    av_requests_today: int
    av_daily_limit: int
