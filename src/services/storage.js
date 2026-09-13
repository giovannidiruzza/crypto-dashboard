/**
 * LocalStorage and Preset Management Service
 */
import { UNIVERSAL_INDICATOR_PRESETS } from './tradingViewIndicators';

const STORAGE_KEYS = {
  GRID_LAYOUT: 'bulldash_grid_layout_v1',
  CHARTS_CONFIG: 'bulldash_charts_config_v1',
  WATCHLISTS: 'bulldash_watchlists_v1',
  ACTIVE_WATCHLIST: 'bulldash_active_watchlist_v1',
  INDICATORS: 'bulldash_indicators_v3', // v3 with Daily VWAP + StDev 1,2,3 default
  SETTINGS: 'bulldash_settings_v1',
  FAVORITES: 'bulldash_favorites_v1'
};

// Default initial charts (Top trending Altcoins on Bitget)
export const DEFAULT_CHARTS = [
  { id: 'c1', symbol: 'BITGET:TRUMPUSDT.P', baseCoin: 'TRUMP', timeframe: '5', isLocked: false, isFavorite: true },
  { id: 'c2', symbol: 'BITGET:STXUSDT.P', baseCoin: 'STX', timeframe: '5', isLocked: false, isFavorite: false },
  { id: 'c3', symbol: 'BITGET:UNITASUSDT.P', baseCoin: 'UNITAS', timeframe: '5', isLocked: false, isFavorite: false },
  { id: 'c4', symbol: 'BITGET:ZECUSDT.P', baseCoin: 'ZEC', timeframe: '5', isLocked: false, isFavorite: false },
  { id: 'c5', symbol: 'BITGET:POLUSDT.P', baseCoin: 'POL', timeframe: '5', isLocked: false, isFavorite: false },
  { id: 'c6', symbol: 'BITGET:MELANIAUSDT.P', baseCoin: 'MELANIA', timeframe: '5', isLocked: false, isFavorite: false },
  { id: 'c7', symbol: 'BITGET:DASHUSDT.P', baseCoin: 'DASH', timeframe: '5', isLocked: false, isFavorite: false },
  { id: 'c8', symbol: 'BITGET:TUTUSDT.P', baseCoin: 'TUT', timeframe: '5', isLocked: false, isFavorite: false },
  { id: 'c9', symbol: 'BITGET:PUMPUSDT.P', baseCoin: 'PUMP', timeframe: '5', isLocked: false, isFavorite: false },
  { id: 'c10', symbol: 'BITGET:CVXUSDT.P', baseCoin: 'CVX', timeframe: '5', isLocked: false, isFavorite: false },
  { id: 'c11', symbol: 'BITGET:ZENUSDT.P', baseCoin: 'ZEN', timeframe: '5', isLocked: false, isFavorite: false },
  { id: 'c12', symbol: 'BITGET:VVVUSDT.P', baseCoin: 'VVV', timeframe: '5', isLocked: false, isFavorite: false },
  { id: 'c13', symbol: 'BITGET:AAVEUSDT.P', baseCoin: 'AAVE', timeframe: '5', isLocked: false, isFavorite: false },
  { id: 'c14', symbol: 'BITGET:ZAMAUSDT.P', baseCoin: 'ZAMA', timeframe: '5', isLocked: false, isFavorite: false },
  { id: 'c15', symbol: 'BITGET:BTCUSDT.P', baseCoin: 'BTC', timeframe: '5', isLocked: false, isFavorite: false },
  { id: 'c16', symbol: 'BITGET:ETHUSDT.P', baseCoin: 'ETH', timeframe: '5', isLocked: false, isFavorite: false }
];

// Default Indicator Profile with TV Catalog IDs (Clean Daily VWAP + StDev Bands 1, 2, 3)
export const DEFAULT_INDICATORS = {
  presetName: 'VWAP Giornaliero (StDev 1, 2, 3)',
  activeIndicatorIds: ['vwap', 'volume'],
  customInputs: {
    vwap: {
      anchor: 'Session',
      stdDev1: 1,
      stdDev2: 2,
      stdDev3: 3
    },
    ema20: { length: 20 },
    ema50: { length: 50 },
    ema100: { length: 100 },
    ema200: { length: 200 },
    atr: { length: 14 }
  },
  showTvHeader: false
};

export const INDICATOR_PRESETS = UNIVERSAL_INDICATOR_PRESETS;

// Curated default watchlists
export const DEFAULT_WATCHLISTS = [
  {
    id: 'top_gainers_bitget',
    name: '🔥 Bitget Top Gainers',
    isDynamic: true,
    symbols: ['TRUMPUSDT', 'STXUSDT', 'UNITASUSDT', 'ZECUSDT', 'POLUSDT', 'MELANIAUSDT', 'DASHUSDT', 'TUTUSDT', 'PUMPUSDT']
  },
  {
    id: 'majors_crypto',
    name: '👑 Major & L1 Coins',
    isDynamic: false,
    symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT', 'SUIUSDT']
  },
  {
    id: 'ai_meme_hype',
    name: '🚀 AI & Meme Coins',
    isDynamic: false,
    symbols: ['TRUMPUSDT', 'PUMPUSDT', 'MELANIAUSDT', 'PEPEUSDT', 'WIFUSDT', 'FETUSDT', 'NEARUSDT', 'RENDERUSDT', 'TAOUSDT']
  }
];

export function loadStoredData() {
  try {
    const layout = localStorage.getItem(STORAGE_KEYS.GRID_LAYOUT) || '3x3';
    const chartsRaw = localStorage.getItem(STORAGE_KEYS.CHARTS_CONFIG);
    const charts = chartsRaw ? JSON.parse(chartsRaw) : DEFAULT_CHARTS;

    const indicatorsRaw = localStorage.getItem(STORAGE_KEYS.INDICATORS);
    let indicators = DEFAULT_INDICATORS;
    if (indicatorsRaw) {
      const parsed = JSON.parse(indicatorsRaw);
      if (Array.isArray(parsed.activeIndicatorIds)) {
        indicators = parsed;
      }
    }

    const watchlistsRaw = localStorage.getItem(STORAGE_KEYS.WATCHLISTS);
    const watchlists = watchlistsRaw ? JSON.parse(watchlistsRaw) : DEFAULT_WATCHLISTS;

    const favoritesRaw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    const favorites = favoritesRaw ? JSON.parse(favoritesRaw) : ['TRUMPUSDT', 'BTCUSDT', 'SOLUSDT'];

    return { layout, charts, indicators, watchlists, favorites };
  } catch (err) {
    console.error('Error reading localStorage:', err);
    return {
      layout: '3x3',
      charts: DEFAULT_CHARTS,
      indicators: DEFAULT_INDICATORS,
      watchlists: DEFAULT_WATCHLISTS,
      favorites: ['TRUMPUSDT', 'BTCUSDT']
    };
  }
}

export function saveLayout(layout) {
  localStorage.setItem(STORAGE_KEYS.GRID_LAYOUT, layout);
}

export function saveCharts(charts) {
  localStorage.setItem(STORAGE_KEYS.CHARTS_CONFIG, JSON.stringify(charts));
}

export function saveIndicators(indicators) {
  localStorage.setItem(STORAGE_KEYS.INDICATORS, JSON.stringify(indicators));
}

export function saveWatchlists(watchlists) {
  localStorage.setItem(STORAGE_KEYS.WATCHLISTS, JSON.stringify(watchlists));
}

export function saveFavorites(favorites) {
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
}
