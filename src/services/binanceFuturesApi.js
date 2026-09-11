/**
 * Binance Futures Order Flow & Session Metrics Service
 * Computes:
 * 1. Session Open Interest Accumulation (ΔOI%)
 * 2. Session Cumulative Volume Delta (CVD) & Taker Buy %
 * 3. Session VWAP & Pullback Distance
 * 4. Divergence & Pullback Setup Detection
 */

const BINANCE_FAPI_BASE = 'https://fapi.binance.com';

// Cache to respect rate limits and ensure smooth UI performance
const metricsCache = new Map();
const CACHE_TTL_MS = 45 * 1000; // 45 seconds TTL

/**
 * Format large USD numbers cleanly ($1.2B, $45.2M, $850K)
 */
export function formatCurrency(num) {
  if (!num || isNaN(num)) return '$0';
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

/**
 * Normalizes symbol to Binance USDT-M format (e.g. 'BTCUSDT', 'SOLUSDT')
 */
export function normalizeBinanceSymbol(symbol) {
  if (!symbol) return '';
  let clean = symbol.toUpperCase().replace(/^BITGET:|^BINANCE:|^BYBIT:|\.P$/g, '');
  if (!clean.endsWith('USDT') && !clean.endsWith('BUSD')) {
    clean += 'USDT';
  }
  return clean;
}

/**
 * Fetches Session Order Flow & VWAP metrics for a single symbol
 */
export async function fetchBinanceSessionMetrics(rawSymbol) {
  const symbol = normalizeBinanceSymbol(rawSymbol);
  const cacheKey = symbol;
  const now = Date.now();

  const cached = metricsCache.get(cacheKey);
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  try {
    // 32 periods of 15m = 8 hours of active intraday session
    const period = '15m';
    const limit = 32;

    const [oiRes, takerRes, klinesRes] = await Promise.all([
      fetch(`${BINANCE_FAPI_BASE}/futures/data/openInterestHist?symbol=${symbol}&period=${period}&limit=${limit}`, {
        headers: { 'Accept': 'application/json' }
      }).then(r => r.ok ? r.json() : []),
      fetch(`${BINANCE_FAPI_BASE}/futures/data/takerlongshortRatio?symbol=${symbol}&period=${period}&limit=${limit}`, {
        headers: { 'Accept': 'application/json' }
      }).then(r => r.ok ? r.json() : []),
      fetch(`${BINANCE_FAPI_BASE}/fapi/v1/klines?symbol=${symbol}&interval=${period}&limit=${limit}`, {
        headers: { 'Accept': 'application/json' }
      }).then(r => r.ok ? r.json() : [])
    ]);

    if (!Array.isArray(klinesRes) || klinesRes.length === 0) {
      throw new Error(`Symbol ${symbol} not found on Binance Futures`);
    }

    // 1. Session VWAP Calculation
    let cumTypicalVol = 0;
    let cumVol = 0;
    let currentPrice = parseFloat(klinesRes[klinesRes.length - 1][4]);

    for (const k of klinesRes) {
      const high = parseFloat(k[2]);
      const low = parseFloat(k[3]);
      const close = parseFloat(k[4]);
      const vol = parseFloat(k[5]);
      const typ = (high + low + close) / 3;
      cumTypicalVol += typ * vol;
      cumVol += vol;
    }

    const sessionVWAP = cumVol > 0 ? (cumTypicalVol / cumVol) : currentPrice;
    const vwapDiffPercent = sessionVWAP > 0 ? (((currentPrice - sessionVWAP) / sessionVWAP) * 100) : 0;

    // 2. Session CVD Calculation (Taker Buy - Taker Sell)
    let sessionCVD = 0;
    let totalBuy = 0;
    let totalSell = 0;
    const deltaSeries = [];

    if (Array.isArray(takerRes) && takerRes.length > 0) {
      for (const t of takerRes) {
        const b = parseFloat(t.buyVol || 0);
        const s = parseFloat(t.sellVol || 0);
        const delta = b - s;
        sessionCVD += delta;
        totalBuy += b;
        totalSell += s;
        deltaSeries.push(delta);
      }
    }

    const totalVolume = totalBuy + totalSell;
    const takerBuyPercent = totalVolume > 0 ? ((totalBuy / totalVolume) * 100) : 50;

    // Check CVD slope over the last 4 periods
    const recentDeltas = deltaSeries.slice(-4);
    const recentCVDPositive = recentDeltas.filter(d => d > 0).length >= 2;

    // 3. Session Open Interest Calculation
    let deltaOIPercent = 0;
    let deltaOIUsd = 0;
    let currentOIUsd = 0;

    if (Array.isArray(oiRes) && oiRes.length > 0) {
      const firstOI = parseFloat(oiRes[0]?.sumOpenInterestValue || 0);
      const lastOI = parseFloat(oiRes[oiRes.length - 1]?.sumOpenInterestValue || 0);
      currentOIUsd = lastOI;
      deltaOIUsd = lastOI - firstOI;
      deltaOIPercent = firstOI > 0 ? ((deltaOIUsd / firstOI) * 100) : 0;
    }

    // 4. Setup Classification (The User's Strategy)
    // - OI Active Participation: deltaOIPercent > 1.5%
    // - VWAP Pullback: Price between -0.3% and +1.5% above VWAP
    // - CVD Alignment: sessionCVD > 0 and takerBuyPercent > 51%
    // - Divergence Check: Price is above VWAP/moving up, but CVD is heavily negative or declining
    let setup = 'NEUTRAL';
    let badgeLabel = 'NEUTRALE';
    let badgeColor = 'bg-slate-800 text-slate-400 border-slate-700';

    const isAboveVWAP = vwapDiffPercent >= -0.2;
    const isInPullbackRange = vwapDiffPercent >= -0.3 && vwapDiffPercent <= 1.6;
    const isExtended = vwapDiffPercent > 2.5;
    const isOIActive = deltaOIPercent > 1.0;
    const isOIDropping = deltaOIPercent < -1.8;
    const isCVDAligned = sessionCVD > 0 && takerBuyPercent >= 51.5;
    const isCVDDivergent = isAboveVWAP && (sessionCVD < 0 || takerBuyPercent < 47.5);

    if (isOIDropping) {
      setup = 'OI_UNWINDING';
      badgeLabel = '🔴 OI UNWINDING';
      badgeColor = 'bg-red-500/10 text-red-400 border-red-500/30';
    } else if (isCVDDivergent) {
      setup = 'DIVERGENT';
      badgeLabel = '⚠️ DIVERGENZA CVD';
      badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    } else if (isOIActive && isCVDAligned && isInPullbackRange) {
      setup = 'PULLBACK_READY';
      badgeLabel = '🎯 PULLBACK BUY READY';
      badgeColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-500/20';
    } else if (isOIActive && isCVDAligned && isExtended) {
      setup = 'TREND_EXTENDED';
      badgeLabel = '🚀 TREND ESTESO (WAIT)';
      badgeColor = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    } else if (!isAboveVWAP) {
      setup = 'BELOW_VWAP';
      badgeLabel = '⚪ SOTTO VWAP';
      badgeColor = 'bg-slate-800/80 text-slate-400 border-slate-700/50';
    } else if (isOIActive && !isCVDAligned) {
      setup = 'OI_ONLY';
      badgeLabel = '🟡 OI+ (CVD DEBOLE)';
      badgeColor = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    } else {
      setup = 'CONSOLIDATION';
      badgeLabel = 'RANGE';
      badgeColor = 'bg-slate-800 text-slate-400 border-slate-700';
    }

    // Composite Score for Ranking Pullbacks to the top
    let compositeScore = 0;
    if (setup === 'PULLBACK_READY') compositeScore += 100;
    if (setup === 'TREND_EXTENDED') compositeScore += 50;
    compositeScore += (deltaOIPercent * 2);
    compositeScore += ((takerBuyPercent - 50) * 3);
    if (isInPullbackRange) compositeScore += 20;

    const data = {
      symbol,
      price: currentPrice,
      sessionVWAP,
      vwapDiffPercent,
      sessionCVD,
      takerBuyPercent,
      recentCVDPositive,
      currentOIUsd,
      deltaOIUsd,
      deltaOIPercent,
      setup,
      badgeLabel,
      badgeColor,
      compositeScore,
      timestamp: now,
      isAvailable: true
    };

    metricsCache.set(cacheKey, { timestamp: now, data });
    return data;
  } catch (error) {
    // Return empty fallback if coin is not listed on Binance Futures
    const fallback = {
      symbol,
      isAvailable: false,
      error: error.message,
      setup: 'NOT_AVAILABLE',
      badgeLabel: 'NO BINANCE DATA',
      badgeColor: 'bg-slate-800/50 text-slate-500 border-slate-800',
      compositeScore: -999
    };
    metricsCache.set(cacheKey, { timestamp: now, data: fallback });
    return fallback;
  }
}

/**
 * Batch fetches Binance metrics for multiple symbols with throttling
 * @param {Array<string>} symbols
 * @param {Function} onUpdate Callback when each symbol is loaded
 */
export async function batchFetchBinanceMetrics(symbols, onUpdate) {
  const cleanSymbols = [...new Set(symbols.map(normalizeBinanceSymbol))];
  const results = {};

  // Process in small batches of 3 to stay within rate limits smoothly
  const BATCH_SIZE = 3;
  for (let i = 0; i < cleanSymbols.length; i += BATCH_SIZE) {
    const chunk = cleanSymbols.slice(i, i + BATCH_SIZE);
    const chunkResults = await Promise.all(
      chunk.map(sym => fetchBinanceSessionMetrics(sym))
    );

    chunkResults.forEach(res => {
      if (res && res.symbol) {
        results[res.symbol] = res;
        if (onUpdate) {
          onUpdate(res.symbol, res);
        }
      }
    });

    // Short 120ms pause between batches
    if (i + BATCH_SIZE < cleanSymbols.length) {
      await new Promise(r => setTimeout(r, 120));
    }
  }

  return results;
}
