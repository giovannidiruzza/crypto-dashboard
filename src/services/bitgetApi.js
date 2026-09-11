/**
 * Bitget USDT-M Futures Service
 * Handles live polling, sorting, filtering, and symbol formatting
 */

const BITGET_FUTURES_API = 'https://api.bitget.com/api/v2/mix/market/tickers?productType=USDT-FUTURES';

export async function fetchBitgetFuturesTickers() {
  try {
    const response = await fetch(BITGET_FUTURES_API, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    if (data.code !== '00000' || !Array.isArray(data.data)) {
      throw new Error(data.msg || 'Invalid Bitget API response');
    }

    // Normalize and format data
    return data.data.map(item => {
      const change24hRaw = parseFloat(item.change24h || 0);
      const changePercent = change24hRaw * 100;
      const lastPrice = parseFloat(item.lastPr || 0);
      const high24h = parseFloat(item.high24h || 0);
      const low24h = parseFloat(item.low24h || 0);
      const usdtVolume = parseFloat(item.usdtVolume || item.quoteVolume || 0);
      const baseVolume = parseFloat(item.baseVolume || 0);
      const fundingRate = parseFloat(item.fundingRate || 0) * 100;

      // Extract clean symbol (e.g. "BTCUSDT" -> base: "BTC", quote: "USDT")
      const rawSymbol = item.symbol || '';
      const baseCoin = rawSymbol.replace(/USDT$/, '');

      return {
        symbol: rawSymbol,
        baseCoin,
        quoteCoin: 'USDT',
        lastPrice,
        change24h: changePercent,
        change24hRaw,
        high24h,
        low24h,
        usdtVolume,
        baseVolume,
        fundingRate,
        tradingViewSymbol: `BITGET:${rawSymbol}.P`,
        bybitSymbol: `BYBIT:${rawSymbol}.P`,
        binanceSymbol: `BINANCE:${rawSymbol}.P`
      };
    });
  } catch (error) {
    console.error('Failed to fetch Bitget tickers:', error);
    // Return sample fallback data if offline or CORS blocked
    return getFallbackTickers();
  }
}

/**
 * Filter and sort tickers by criteria
 */
export function filterAndSortTickers(tickers, options = {}) {
  const {
    search = '',
    minVolume = 0,
    sortBy = 'gainers', // 'gainers', 'losers', 'volume', 'alpha'
    limit = 100
  } = options;

  let filtered = tickers.filter(t => {
    // Search query
    if (search) {
      const q = search.toUpperCase().trim();
      if (!t.symbol.includes(q) && !t.baseCoin.includes(q)) {
        return false;
      }
    }

    // Min volume filter (in USD)
    if (minVolume > 0 && t.usdtVolume < minVolume) {
      return false;
    }

    return true;
  });

  // Sort
  if (sortBy === 'gainers') {
    filtered.sort((a, b) => b.change24h - a.change24h);
  } else if (sortBy === 'losers') {
    filtered.sort((a, b) => a.change24h - b.change24h);
  } else if (sortBy === 'volume') {
    filtered.sort((a, b) => b.usdtVolume - a.usdtVolume);
  } else if (sortBy === 'alpha') {
    filtered.sort((a, b) => a.symbol.localeCompare(b.symbol));
  }

  return filtered.slice(0, limit);
}

/**
 * Format price for clean display (handles micro-pennies cleanly)
 */
export function formatPrice(price) {
  if (price === 0 || isNaN(price)) return '$0.00';
  if (price >= 1000) return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return '$' + price.toFixed(4);
  if (price >= 0.001) return '$' + price.toFixed(5);
  return '$' + price.toFixed(7);
}

/**
 * Format large USD volume numbers ($12.5M, $450K, $1.2B)
 */
export function formatVolume(volume) {
  if (volume >= 1_000_000_000) {
    return `$${(volume / 1_000_000_000).toFixed(2)}B`;
  }
  if (volume >= 1_000_000) {
    return `$${(volume / 1_000_000).toFixed(2)}M`;
  }
  if (volume >= 1_000) {
    return `$${(volume / 1_000).toFixed(1)}K`;
  }
  return `$${volume.toFixed(0)}`;
}

/**
 * Fallback dataset if external network is unavailable
 */
function getFallbackTickers() {
  const sample = [
    { symbol: 'TRUMPUSDT', baseCoin: 'TRUMP', change24h: 42.15, lastPrice: 2.594, usdtVolume: 185000000 },
    { symbol: 'STXUSDT', baseCoin: 'STX', change24h: 26.48, lastPrice: 0.2183, usdtVolume: 94000000 },
    { symbol: 'UNITASUSDT', baseCoin: 'UNITAS', change24h: 25.16, lastPrice: 0.4581, usdtVolume: 32000000 },
    { symbol: 'ZECUSDT', baseCoin: 'ZEC', change24h: 24.39, lastPrice: 836.60, usdtVolume: 120000000 },
    { symbol: 'POLUSDT', baseCoin: 'POL', change24h: 22.80, lastPrice: 0.1097, usdtVolume: 51000000 },
    { symbol: 'MELANIAUSDT', baseCoin: 'MELANIA', change24h: 22.16, lastPrice: 0.11308, usdtVolume: 67000000 },
    { symbol: 'DASHUSDT', baseCoin: 'DASH', change24h: 20.59, lastPrice: 42.58, usdtVolume: 88000000 },
    { symbol: 'TUTUSDT', baseCoin: 'TUT', change24h: 19.13, lastPrice: 0.05093, usdtVolume: 15000000 },
    { symbol: 'PUMPUSDT', baseCoin: 'PUMP', change24h: 18.81, lastPrice: 0.00475, usdtVolume: 210000000 },
    { symbol: 'BTCUSDT', baseCoin: 'BTC', change24h: 1.45, lastPrice: 77350.00, usdtVolume: 3600000000 },
    { symbol: 'ETHUSDT', baseCoin: 'ETH', change24h: 3.12, lastPrice: 2435.50, usdtVolume: 3700000000 },
    { symbol: 'SOLUSDT', baseCoin: 'SOL', change24h: 7.85, lastPrice: 194.20, usdtVolume: 1200000000 }
  ];

  return sample.map(s => ({
    ...s,
    quoteCoin: 'USDT',
    high24h: s.lastPrice * 1.05,
    low24h: s.lastPrice * 0.95,
    fundingRate: 0.01,
    tradingViewSymbol: `BITGET:${s.symbol}.P`,
    bybitSymbol: `BYBIT:${s.symbol}.P`,
    binanceSymbol: `BINANCE:${s.symbol}.P`
  }));
}
