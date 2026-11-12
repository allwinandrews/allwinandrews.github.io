"""Run the trading-bot portfolio backtest and export block-bootstrap paths.
Run with the trading-bot venv, from the trading-bot folder:
  python ../portfolio/scripts/export_montecarlo.py ../portfolio/public/data/montecarlo.json"""
import json, sys
import numpy as np
sys.path.insert(0, ".")
from backtester.monte_carlo import block_bootstrap, DEFAULT_BLOCK_DAYS, DEFAULT_HORIZON_DAYS
from backtester.portfolio_engine import run_portfolio_backtest
from data.loader import load_price_data
from strategies.moving_average import DEFAULT_LONG_WINDOW, DEFAULT_SHORT_WINDOW, generate_signals
from strategies.regime import DEFAULT_REGIME_WINDOW, apply_regime_filter, market_regime_signal
from run_monte_carlo import DEFAULT_TICKERS

START, END, CAPITAL = "2015-01-01", "2026-11-07", 500.0
prices, signals = {}, {}
for t in DEFAULT_TICKERS:
    try:
        px = load_price_data(t, start=START, end=END)
    except Exception as e:
        print("skip", t, e); continue
    prices[t] = px
    signals[t] = generate_signals(px, DEFAULT_SHORT_WINDOW, DEFAULT_LONG_WINDOW)
regime = market_regime_signal(load_price_data("SPY", start=START, end=END), window=DEFAULT_REGIME_WINDOW)
signals = {t: apply_regime_filter(s, regime) for t, s in signals.items()}
pf = run_portfolio_backtest(prices, signals, initial_capital=CAPITAL, stop_loss_pct=0.05,
                            risk_per_trade_pct=0.0125, max_positions=3, pricing="fixed")
curve = pf.equity_curve
summary = block_bootstrap(curve).summary(CAPITAL)

# Same method as backtester.monte_carlo, but keeping the paths for drawing.
rets = curve.pct_change().dropna().to_numpy()
rng = np.random.default_rng(42)
H, B, N = DEFAULT_HORIZON_DAYS, DEFAULT_BLOCK_DAYS, 160
paths = []
for _ in range(N):
    starts = rng.integers(0, len(rets) - B + 1, size=-(-H // B))
    r = np.concatenate([rets[s:s + B] for s in starts])[:H]
    eq = np.concatenate([[1.0], np.cumprod(1 + r)])
    paths.append([round(float(v), 4) for v in eq[::4]])
json.dump({"tickers": len(prices), "start": str(curve.index[0].date()), "end": str(curve.index[-1].date()),
           "horizonDays": H, "blockDays": B, "summary": summary, "paths": paths},
          open(sys.argv[1], "w"), separators=(",", ":"))
print(summary)
