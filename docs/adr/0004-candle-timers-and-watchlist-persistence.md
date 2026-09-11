# 4. Candle Countdown Timers and Multi-Watchlist Persistence

Date: 2026-08-22

## Status

Accepted

## Context

Traders need awareness of candle close events across multiple timeframes simultaneously (e.g. 5m scalping, 15m momentum, 1h trend, 4h macro) to time their trade entries accurately. Furthermore, users require customizable watchlist presets that persist across sessions and can be shared or backed up.

## Decision

1. **Header Candle Countdown Badges**:
   - Fixed badges in the main top navigation bar displaying live countdowns for `5m`, `15m`, `1h`, `4h` intervals.
   - Visual alert state: when remaining time is <= 30 seconds for short intervals (or <= 60s for long intervals), the badge pulses with an amber/red warning highlight.
2. **Watchlist Manager & Persistence**:
   - Maintain predefined curated lists (🔥 Bitget Top Gainers, 👑 Major & L1 Coins, 🚀 AI & Meme Coins) alongside user-created custom watchlists.
   - Persist active watchlist, custom lists, and favorites in browser `localStorage`.
   - Provide a dedicated Watchlist Modal with JSON Import & Export capabilities to facilitate backups and sharing.

## Consequences

- **Pros**:
  - Always-visible candle timers prevent entering positions right before a high-volatility candle close.
  - Portable configuration via JSON export/import.
- **Cons**:
  - Requires continuous 1-second interval timer subscription in React state (lightweight).
