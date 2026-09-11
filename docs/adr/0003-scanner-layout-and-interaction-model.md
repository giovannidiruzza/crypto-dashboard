# 3. Scanner Drawer, Grid Interaction and Active Slot Model

Date: 2026-08-22

## Status

Accepted

## Context

Traders navigating high-volatility cryptocurrency markets require high-speed interactions to scan hundreds of Bitget USDT-M futures and map promising momentum setups to specific charts in their multi-chart grid without cumbersome drag-and-drop or page reloads.

## Decision

1. **Collapsible Scanner Drawer**: Implement a slide-out sidebar on the left side of the dashboard containing:
   - Live search input with fuzzy ticker matching.
   - 24h gainers/losers/volume sorting tabs.
   - Minimum 24h volume threshold filter (All, >$500K, >$1M, >$5M, >$10M, >$50M).
   - "Carica Top nella Griglia" (One-Click Bulk Fill) button loading the top N gainers into active grid charts.
2. **Active Slot Selection Model**:
   - Clicking any Chart Card header or border highlights it as the currently "Active Slot" with a distinct cyan glow border.
   - Clicking any token item in the Scanner Drawer or Search Dialog instantly updates the active slot with the chosen ticker.
   - If no slot is explicitly selected, clicking a token replaces slot #1 or opens a quick slot selector.
3. **Responsive Grid Switcher**:
   - Support presets for 1 (1x1), 4 (2x2), 6 (3x2), 9 (3x3 default), 12 (4x3), and 16 (4x4) charts.
   - Single-chart Focus/Maximize mode allowing expanding any individual card to fill 100% of the viewport.

## Consequences

- **Pros**:
  - Extremely fast workflow replicating professional trading desks.
  - Zero clutter: sidebar can be toggled off for distraction-free charting.
  - Smooth grid transitions across 1, 4, 6, 9, 12, 16 chart configurations.
- **Cons**:
  - Requires maintaining active slot selection index in global application state.
