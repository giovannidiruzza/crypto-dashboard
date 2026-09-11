# 1. Bitget Futures Scanner and TradingView Multi-Chart Integration

Date: 2026-08-22

## Status

Accepted

## Context

The user requested a web dashboard replicating the core functionalities of "Bull Web", with a specific emphasis on monitoring high-performing cryptocurrency futures from Bitget sorted by 24h % change. We need a performant, zero-cost, real-time solution capable of rendering 1 to 16 live charts simultaneously while fetching live market rankings from Bitget.

## Decision

1. **Market Data Feed**: Directly query Bitget's public v2 REST API (`https://api.bitget.com/api/v2/mix/market/tickers?productType=USDT-FUTURES`) on configurable intervals (default: 15s / manual reload) to fetch all ~760 USDT-M contracts, compute 24h % variation, volume, and last price.
2. **Chart Rendering Engine**: Embed TradingView Advanced Real-Time Chart widgets configured in dark mode with dark theme styling, native drawing tools, volume, and pre-configured EMAs (20, 50, 100, 200).
3. **Symbol Resolution**: Map Bitget futures symbols cleanly to TradingView identifiers (`BITGET:<SYMBOL>.P` / `BITGET:<SYMBOL>` or fallback to Bybit/Binance if unavailable) so real-time candlestick charts and orderflow render immediately without requiring paid API keys.
4. **Synchronization Layer**: State management in React connecting the Global Timeframe broadcast bus, individual chart lock states (`isLocked`), candle close countdown intervals, and dynamic grid dimensions (1x1 up to 4x4).

## Consequences

- **Pros**:
  - No API key or server authentication required.
  - High fidelity TradingView charts with full technical analysis features and dark mode.
  - Instant 1-click loading of top Bitget gainers into 4, 6, 9, 12, or 16 chart slots.
  - Zero latency impact on browser performance.
- **Cons**:
  - Embedding multiple iframes requires good client hardware for 9-16 simultaneous charts; handled gracefully via lazy rendering and memory-conscious widget management.
