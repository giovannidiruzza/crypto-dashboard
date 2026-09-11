# 2. Global Indicator Synchronization System

Date: 2026-08-22

## Status

Accepted

## Context

In multi-chart trading dashboards (like Bull Web), traders need visual consistency across all monitored altcoins. Manually adding indicators (e.g. EMAs, RSI, Bollinger Bands) to 9 or 16 separate charts is tedious and inefficient. The user specifically requested the ability to choose indicators globally (or adjust them in one place) and have them synchronized across all charts in the grid.

## Decision

1. **Indicator Profile State**: Maintain a centralized `indicatorConfig` state in the application containing active indicator presets (e.g., EMA 20, EMA 50, EMA 100, EMA 200, Bollinger Bands, Volume, RSI, MACD, Stochastic).
2. **Global Indicator Control Modal / Bar**: Provide a dedicated "Indicatori" button and modal in the top header where the user can:
   - Toggle individual EMA lines with custom periods & colors.
   - Toggle overlay studies (Bollinger Bands, VWAP, Ichimoku).
   - Toggle sub-pane oscillators (RSI, MACD).
   - Choose from quick presets (e.g., "Bull Web EMA Ribbon", "Scalping Setup", "Momentum RSI+MACD", "Clean Price Action").
3. **Synchronous Chart Propagation**: When indicators are updated or toggled, the application broadcasts the new study parameters to the TradingView chart widget configuration across all active chart instances in the grid, seamlessly reloading the study configurations without resetting the zoom/pan or timeframes.

## Consequences

- **Pros**:
  - Instant one-click indicator customization across all 9-16 charts.
  - Zero repetitive manual setup per chart.
  - Full flexibility to customize EMA periods and colors.
- **Cons**:
  - Requires re-instantiating the widget studies or re-rendering widget containers when study array changes; optimized by memoized chart instances.
