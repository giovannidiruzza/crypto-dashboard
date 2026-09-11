# 5. Polling Strategy, Web Audio Alerts, Strict Bitget Focus and Cyber Visual Theme

Date: 2026-08-22

## Status

Accepted

## Context

Finalizing the real-time execution parameters, sound warning system, exchange scope, and aesthetic design system for the dashboard.

## Decision

1. **Market Data Polling**:
   - Query Bitget USDT-M Futures endpoint every 15 seconds.
   - Display a circular progress / countdown indicator in the header next to a manual reload button.
2. **Web Audio Alerts**:
   - Synthesize a subtle two-tone chime at the precise instant a short-term candle (5m/15m) closes using the native browser `WebAudio` API (zero external asset dependencies).
   - Provide a global Mute/Unmute (🔔 / 🔕) button in the header (default: muted).
3. **Strict Bitget Focus**:
   - Confine the symbol resolver and ticker scanner exclusively to Bitget USDT-M Futures contracts (`BITGET:<SYMBOL>.P`), ensuring 100% data consistency between the rankings and TradingView charts.
4. **Deep Obsidian Cyber Visual Theme**:
   - Dark palette background (`#080b11` / `#0d111a`), neon cyan highlights (`#00f2fe`) for active chart slot, emerald green (`#00e676`) for gainers, rose red (`#ff3366`) for losers.
   - Monospace typography (`JetBrains Mono`) for financial figures and crisp font (`Inter`) for UI elements.

## Consequences

- **Pros**:
  - Predictable API behavior, zero rate-limit issues.
  - Zero external sound asset load errors.
  - High aesthetic polish with zero visual clutter from other exchanges.
- **Cons**:
  - Audio requires an initial user interaction (click) on the page to satisfy browser autoplay security policies (handled gracefully).
