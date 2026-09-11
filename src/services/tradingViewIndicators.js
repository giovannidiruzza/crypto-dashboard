/**
 * TradingView Native Studies & Indicator Catalog
 * Comprehensive catalog of TradingView basic studies for universal multi-chart synchronization
 */

export const TV_INDICATOR_CATEGORIES = [
  { id: 'all', label: 'Tutti' },
  { id: 'trend', label: 'Trend & Medie' },
  { id: 'momentum', label: 'Momentum & Oscillatori' },
  { id: 'volatility', label: 'Volatilità & TP/SL' },
  { id: 'volume', label: 'Volume & Order Flow' }
];

export const TV_INDICATORS_LIBRARY = [
  // 1. Trend & Moving Averages
  {
    id: 'vwap',
    studyId: 'VWAP@tv-basicstudies',
    name: 'VWAP (con Bande di Deviazione Standard ±1, ±2, ±3)',
    category: 'volume',
    description: 'Volume Weighted Average Price con 3 bande superiori e inferiori di deviazione standard.',
    defaultInputs: {
      'Anchor Period': 'Session',
      'Source': 'hlc3',
      'Offset': 0,
      'Bands Multiplier #1': 1.0,
      'Bands Multiplier #2': 2.0,
      'Bands Multiplier #3': 3.0
    },
    isOverlay: true
  },
  {
    id: 'ema20',
    studyId: 'MAExp@tv-basicstudies',
    name: 'EMA 20 (Media Esponenziale Veloce)',
    category: 'trend',
    description: 'Media mobile esponenziale a 20 periodi per supporto dinamico a breve termine.',
    defaultInputs: { length: 20 },
    isOverlay: true
  },
  {
    id: 'ema50',
    studyId: 'MAExp@tv-basicstudies',
    name: 'EMA 50 (Media Esponenziale Trend Intermedio)',
    category: 'trend',
    description: 'Media mobile esponenziale a 50 periodi per conferma del trend.',
    defaultInputs: { length: 50 },
    isOverlay: true
  },
  {
    id: 'ema100',
    studyId: 'MAExp@tv-basicstudies',
    name: 'EMA 100 (Media Esponenziale Macro)',
    category: 'trend',
    description: 'Media mobile esponenziale a 100 periodi per supporto macroeconomico.',
    defaultInputs: { length: 100 },
    isOverlay: true
  },
  {
    id: 'ema200',
    studyId: 'MAExp@tv-basicstudies',
    name: 'EMA 200 (Media Esponenziale Trend Primario)',
    category: 'trend',
    description: 'Media a 200 periodi: linea di demarcazione tra Bull e Bear market.',
    defaultInputs: { length: 200 },
    isOverlay: true
  },
  {
    id: 'supertrend',
    studyId: 'Supertrend@tv-basicstudies',
    name: 'Supertrend',
    category: 'trend',
    description: 'Indicatore di trend-following basato su ATR che fornisce segnali dinamici di inversione.',
    defaultInputs: { length: 10, factor: 3 },
    isOverlay: true
  },
  {
    id: 'ichimoku',
    studyId: 'IchimokuCloud@tv-basicstudies',
    name: 'Ichimoku Kinko Hyo (Nuvola di Ichimoku)',
    category: 'trend',
    description: 'Sistema completo di trend, momentum, supporti/resistenze e Nuvola (Kumo).',
    defaultInputs: {},
    isOverlay: true
  },
  {
    id: 'parabolic_sar',
    studyId: 'ParabolicSAR@tv-basicstudies',
    name: 'Parabolic SAR',
    category: 'trend',
    description: 'Punti di stop and reverse per trailing stop e individuazione cambi di direzione.',
    defaultInputs: { start: 0.02, increment: 0.02, maximum: 0.2 },
    isOverlay: true
  },

  // 2. Volatilità & TP/SL
  {
    id: 'atr',
    studyId: 'ATR@tv-basicstudies',
    name: 'ATR (Average True Range)',
    category: 'volatility',
    description: 'Misura la volatilità reale. Ideale per calcolare Stop Loss dinamici (1.5x) e TP (3x).',
    defaultInputs: { length: 14 },
    isOverlay: false
  },
  {
    id: 'bollinger_bands',
    studyId: 'BB@tv-basicstudies',
    name: 'Bande di Bollinger (Bollinger Bands)',
    category: 'volatility',
    description: 'Canale di volatilità basato su deviazioni standard per identificare breakout e squeeze.',
    defaultInputs: { length: 20, mult: 2 },
    isOverlay: true
  },
  {
    id: 'keltner_channels',
    studyId: 'KeltnerChannels@tv-basicstudies',
    name: 'Canali di Keltner (Keltner Channels)',
    category: 'volatility',
    description: 'Canali basati su ATR e media esponenziale per trading sui canali di volatilità.',
    defaultInputs: { length: 20, mult: 2 },
    isOverlay: true
  },

  // 3. Momentum & Oscillatori
  {
    id: 'rsi',
    studyId: 'RSI@tv-basicstudies',
    name: 'RSI (Relative Strength Index)',
    category: 'momentum',
    description: 'Oscillatore di momentum per identificare ipercomprato (>70), ipervenduto (<30) e divergenze.',
    defaultInputs: { length: 14 },
    isOverlay: false
  },
  {
    id: 'macd',
    studyId: 'MACD@tv-basicstudies',
    name: 'MACD (Moving Average Convergence Divergence)',
    category: 'momentum',
    description: 'Istogramma e linee di convergenza/divergenza per segnali di entrata/uscita sul momentum.',
    defaultInputs: { fastLength: 12, slowLength: 26, signalLength: 9 },
    isOverlay: false
  },
  {
    id: 'stoch_rsi',
    studyId: 'StochasticRSI@tv-basicstudies',
    name: 'Stochastic RSI (Stocastico RSI)',
    category: 'momentum',
    description: 'Oscillatore ad alta reattività per timing preciso nei punti di swing.',
    defaultInputs: { lengthRSI: 14, lengthStoch: 14, smoothK: 3, smoothD: 3 },
    isOverlay: false
  },
  {
    id: 'stochastic',
    studyId: 'Stochastic@tv-basicstudies',
    name: 'Stochastic Oscillator (Stocastico Classico)',
    category: 'momentum',
    description: 'Confronta il prezzo di chiusura con il range di prezzo su un determinato periodo.',
    defaultInputs: { length: 14, smoothK: 3, smoothD: 3 },
    isOverlay: false
  },
  {
    id: 'awesome_oscillator',
    studyId: 'AwesomeOscillator@tv-basicstudies',
    name: 'Awesome Oscillator (AO)',
    category: 'momentum',
    description: 'Misura la dinamica del mercato confrontando le medie a 5 e 34 periodi.',
    defaultInputs: {},
    isOverlay: false
  },
  {
    id: 'cci',
    studyId: 'CCI@tv-basicstudies',
    name: 'CCI (Commodity Channel Index)',
    category: 'momentum',
    description: 'Valuta la forza del trend e individua le condizioni estreme di prezzo.',
    defaultInputs: { length: 20 },
    isOverlay: false
  },
  {
    id: 'williams_r',
    studyId: 'WilliamsR@tv-basicstudies',
    name: 'Williams %R',
    category: 'momentum',
    description: 'Oscillatore di momentum per individuare ipercomprato/ipervenduto tra 0 e -100.',
    defaultInputs: { length: 14 },
    isOverlay: false
  },

  // 4. Volume & Order Flow
  {
    id: 'volume',
    studyId: 'Volume@tv-basicstudies',
    name: 'Volume (Barre di Volume)',
    category: 'volume',
    description: 'Istogramma dei volumi scambiati colorato per candele rialziste/ribassiste.',
    defaultInputs: {},
    isOverlay: false
  },
  {
    id: 'cmf',
    studyId: 'ChaikinMoneyFlow@tv-basicstudies',
    name: 'Chaikin Money Flow (CMF)',
    category: 'volume',
    description: 'Misura la pressione di accumulazione e distribuzione istituzionale.',
    defaultInputs: { length: 20 },
    isOverlay: false
  },
  {
    id: 'mfi',
    studyId: 'MoneyFlow@tv-basicstudies',
    name: 'Money Flow Index (MFI)',
    category: 'volume',
    description: 'RSI ponderato per i volumi: quantifica l afflusso e deflusso di capitale.',
    defaultInputs: { length: 14 },
    isOverlay: false
  }
];

/**
 * Universal Presets
 */
export const UNIVERSAL_INDICATOR_PRESETS = [
  {
    id: 'vwap_session_orderflow',
    name: '🧭 VWAP & Bande Deviazione Std (1, 2, 3) + ATR',
    activeIds: ['vwap', 'atr', 'volume']
  },
  {
    id: 'bullweb_ema_ribbon',
    name: '🔥 Bull Web EMA Ribbon (EMA 20, 50, 100, 200 + Volume)',
    activeIds: ['ema20', 'ema50', 'ema100', 'ema200', 'volume']
  },
  {
    id: 'scalping_momentum',
    name: '⚡ Scalper Pro (EMA 20 + RSI + MACD + Volume)',
    activeIds: ['ema20', 'rsi', 'macd', 'volume']
  },
  {
    id: 'volatility_breakout',
    name: '🎯 Volatility Breakout (Bande Bollinger + Supertrend + Volume)',
    activeIds: ['bollinger_bands', 'supertrend', 'volume']
  },
  {
    id: 'all_in_one_pro',
    name: '👑 Full Suite Pro (VWAP + EMA Ribbon + ATR + RSI + Volume)',
    activeIds: ['vwap', 'ema20', 'ema50', 'ema200', 'atr', 'rsi', 'volume']
  },
  {
    id: 'clean_candles',
    name: '✨ Clean Price Action (Solo Volume)',
    activeIds: ['volume']
  }
];

/**
 * Converts active indicator IDs array into the exact TradingView Study array format
 */
export function buildTradingViewStudiesArray(activeIndicatorIds = [], customInputs = {}) {
  const studies = [];

  activeIndicatorIds.forEach(id => {
    const item = TV_INDICATORS_LIBRARY.find(ind => ind.id === id);
    if (!item) return;

    if (id === 'vwap') {
      // VWAP with full Standard Deviation Multipliers
      studies.push({
        id: 'VWAP@tv-basicstudies',
        inputs: {
          'Anchor Period': 'Session',
          'Source': 'hlc3',
          'Offset': 0,
          'Bands Multiplier #1': 1.0,
          'Bands Multiplier #2': 2.0,
          'Bands Multiplier #3': 3.0
        }
      });
    } else if (id === 'ema20') {
      studies.push({
        id: 'MASimple@tv-basicstudies',
        inputs: { length: customInputs?.ema20?.length || 20 },
        type: 'moving_average_exponential'
      });
    } else if (id === 'ema50') {
      studies.push({
        id: 'MASimple@tv-basicstudies',
        inputs: { length: customInputs?.ema50?.length || 50 },
        type: 'moving_average_exponential'
      });
    } else if (id === 'ema100') {
      studies.push({
        id: 'MASimple@tv-basicstudies',
        inputs: { length: customInputs?.ema100?.length || 100 },
        type: 'moving_average_exponential'
      });
    } else if (id === 'ema200') {
      studies.push({
        id: 'MASimple@tv-basicstudies',
        inputs: { length: customInputs?.ema200?.length || 200 },
        type: 'moving_average_exponential'
      });
    } else if (id === 'atr') {
      studies.push({
        id: 'ATR@tv-basicstudies',
        inputs: { length: customInputs?.atr?.length || 14 }
      });
    } else {
      // Standard string study for TradingView
      studies.push(item.studyId);
    }
  });

  return studies;
}
