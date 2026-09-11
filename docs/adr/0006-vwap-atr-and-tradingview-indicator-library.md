# 6. VWAP with Standard Deviations, ATR TP/SL and Native TradingView Indicators Library

Date: 2026-08-22

## Status

Accepted

## Context

The user requested advanced technical analysis tools:
1. **VWAP (Volume Weighted Average Price)** with standard deviation bands (1, 2, 3) for session orderflow and mean-reversion trading.
2. **ATR (Average True Range)** with customizable periods and multipliers for dynamic Take Profit (TP) and Stop Loss (SL) volatility calculations.
3. Access to TradingView's full native Indicator Library (`fx`) allowing traders to search and apply any indicator directly from TradingView's built-in repository (100+ indicators).

## Decision

1. **VWAP Multi-Band Study Integration**:
   - Add `VWAP@tv-basicstudies` to the global indicator builder with toggles for Standard Deviation Bands 1, 2, and 3.
2. **ATR Volatility & TP/SL Study Integration**:
   - Add `ATR@tv-basicstudies` and `Supertrend@tv-basicstudies` with customizable periods (e.g. 14, 7, 21) and TP/SL multipliers.
3. **Native TradingView Indicator Library Access**:
   - Provide a toggle to enable TradingView's native top toolbar (`header_indicators`), giving direct access to the `fx Indicator` modal on any chart.
   - Add a quick `fx` button in the chart header allowing instant indicator library search.

## Consequences

- **Pros**:
  - Full flexibility: traders can use both centralized 1-click global indicator presets and search the entire TradingView indicator catalog.
  - Complete support for VWAP deviation trading and ATR-based risk management.
- **Cons**:
  - Custom indicators added via TradingView's native `fx` modal are local to that widget instance unless included in global presets.
