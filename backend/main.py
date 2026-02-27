"""
NARRA — Narrative Risk Reasoning Agent
FastAPI Python Backend

Run with:
    uvicorn main:app --reload --port 8000

Or via Docker:
    docker build -t narra-backend .
    docker run -p 8000:8000 narra-backend
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import logging

from routers import (
    stocks,
    portfolio,
    alerts,
    risk,
    regime,
    hedges,
    analogs,
    simulation,
    audit,
    system_health,
)
from services.alert_agent import alert_agent
from config import settings

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("narra")


# ── Lifespan ───────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start background tasks on startup, clean up on shutdown."""
    logger.info("🚀 NARRA Backend starting up...")
    # Start the alert monitoring agent
    task = asyncio.create_task(alert_agent.run_monitoring_loop())
    yield
    logger.info("🛑 NARRA Backend shutting down...")
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="NARRA — Narrative Risk Reasoning Agent",
    description=(
        "Autonomous institutional scenario engine. "
        "Real-time narrative-to-factor translation, regime-aware simulation, "
        "autonomous hedge optimization, and governance-native design."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS (allow the Vite frontend) ────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(stocks.router,        prefix="/api/stocks",      tags=["Stocks"])
app.include_router(portfolio.router,     prefix="/api/portfolio",   tags=["Portfolio"])
app.include_router(alerts.router,        prefix="/api/alerts",      tags=["Alerts"])
app.include_router(risk.router,          prefix="/api/risk",        tags=["Risk Engine"])
app.include_router(regime.router,        prefix="/api/regime",      tags=["Regime Engine"])
app.include_router(hedges.router,        prefix="/api/hedges",      tags=["Hedge Engine"])
app.include_router(analogs.router,       prefix="/api/analogs",     tags=["Historical Analogs"])
app.include_router(simulation.router,    prefix="/api/simulation",  tags=["Monte Carlo"])
app.include_router(audit.router,         prefix="/api/audit",       tags=["Audit Trail"])
app.include_router(system_health.router, prefix="/api/health",      tags=["System Health"])


# ── Root ───────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    return {
        "system": "NARRA",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/api/status", tags=["Root"])
async def status():
    return {
        "status": "operational",
        "alert_agent": alert_agent.status,
        "monitored_positions": len(alert_agent.holdings),
        "alerts_fired_today": alert_agent.alerts_today,
        "uptime_seconds": alert_agent.uptime_seconds,
    }
