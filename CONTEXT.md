# CONTEXT: Crypto Multi-Chart Dashboard (Bull Web Style)

## Ubiquitous Language & Glossary

### Core Entities & Concepts

- **Multi-Chart Grid (`Griglia Grafici`)**: The central responsive layout rendering multiple cryptocurrency price charts concurrently (1x1, 2x2, 2x3, 3x3 [default 9], 4x3, 4x4).
- **Chart Card (`Scheda Grafico`)**: An individual tile within the grid containing a single cryptocurrency pair chart, local timeframe controls, lock status, maximize/fullscreen action, and quick replacement tools.
- **Global Timeframe (`Timeframe Globale`)**: The header controls (`1m`, `5m`, `15m`, `30m`, `1h`, `4h`, `12h`, `1d`, `1w`, `1M`) that broadcast a timeframe change to all unlocked charts simultaneously.
- **Local Timeframe (`Timeframe Locale`)**: The individual timeframe bar on a specific Chart Card, allowing independent timeframe setting.
- **Timeframe Lock (`Blocco Timeframe` 🔒)**: A toggle on a Chart Card preventing Global Timeframe broadcasts from overriding that card's local timeframe.
- **Global Indicator Synchronization (`Sincronizzazione Indicatori Globale`)**: A centralized indicator manager allowing the user to select and configure indicators (e.g. EMA Ribbons [20, 50, 100, 200], Bollinger Bands, RSI, MACD, Volume, Supertrend) and automatically propagate the selected indicator bundle across all grid charts simultaneously.
- **Candle Countdown Timer (`Timer Chiusura Candela`)**: Dynamic indicators showing remaining time until current candle close for multiple active intervals (`5m`, `15m`, `1h`, `4h`, `1d`), with flashing color warnings in the final seconds.
- **Bitget Futures Scanner (`Classifica Futures Bitget`)**: Real-time integration with Bitget USDT-M Futures API fetching 24h % price change, 24h volume, and last price, sorting top gainers and losers.
- **Liquidity / Volume Filter (`Filtro Volume Minimo`)**: Configurable threshold (e.g. All, >$500K, >$1M, >$5M, >$10M) to filter out illiquid tokens from the gainers ranking.
- **One-Click Grid Fill (`Carica Top nella Griglia`)**: Instant mapping function populating the active grid slots with the top N highest-performing Bitget Futures contracts.
- **Exchange Symbol Resolver (`Risolutore Simboli Exchange`)**: Translates ticker symbols between Bitget, Bybit, and Binance formats for TradingView widget compatibility (e.g. `BITGET:XYZUSDT.P`, `BYBIT:XYZUSDT.P`, `BINANCE:XYZUSDT.P`).
- **Focus / Maximize Mode (`Modalità Focus` ⛶)**: Expanding a single Chart Card to fill the viewport seamlessly.
- **Active Slot Selection (`Slot Grafico Attivo`)**: The currently focused chart slot (with visual border glow) where tokens chosen from the Scanner Drawer or Search Dialog are instantly routed.
- **Scanner Drawer (`Pannello Laterale Scanner`)**: The collapsible side drawer housing the real-time Bitget Futures screener, search filter, liquidity selector, and one-click grid populate action.
- **Watchlist & Layout Preset (`Preset & Watchlist`)**: User-defined and system-curated collections of cryptocurrency pairs saved in `localStorage` with JSON import/export capability.
- **Audio Candle Alert (`Avviso Acustico Chiusura Candela` 🔔)**: Optional Web Audio synthesized sound chime played exactly when a tracked candle timeframe closes.
- **Auto-Sync Polling (`Sincronizzazione Automatica Prezzi`)**: 15-second background polling cycle updating 24h variation and volumes from Bitget with a visual countdown cycle.
- **VWAP Multi-Band (`VWAP con Bande di Deviazione Standard`)**: Volume Weighted Average Price with optional ±1, ±2, and ±3 standard deviation bands for session mean-reversion analysis.
- **ATR Volatility & Dynamic TP/SL (`ATR per Take Profit & Stop Loss`)**: Average True Range indicator with customizable lookback period and risk/reward multipliers for volatility-adjusted exit targets.
- **TradingView Native Indicator Library (`Libreria Indicatori Nativa TradingView fx`)**: Integrated access to TradingView's full repository of 100+ technical indicators directly within each chart card.



