import React from 'react';
import { 
  Lock, 
  Unlock, 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  Star, 
  Search,
  TrendingUp,
  TrendingDown,
  Sliders
} from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';
import { formatPrice, formatVolume } from '../services/bitgetApi';
import { formatCVD, formatCurrency } from '../services/binanceFuturesApi';

const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1D'];

const ChartCard = ({
  chart,
  index,
  indicatorConfig,
  liveTickerData,
  binanceMetric,
  isActiveSlot,
  isMaximized,
  onSelectSlot,
  onToggleMaximize,
  onUpdateChart,
  onOpenSearch,
  onToggleFavorite
}) => {
  // Extract display symbol & exchange
  const rawSymbol = chart.symbol || 'BITGET:BTCUSDT.P';
  const parts = rawSymbol.split(':');
  const exchange = parts.length > 1 ? parts[0] : 'BITGET';
  const cleanSymbol = (parts.length > 1 ? parts[1] : rawSymbol).replace(/\.P$/, '');

  // Extract 24h data from live Bitget stream if available
  const ticker = liveTickerData?.[cleanSymbol] || null;
  const change24h = ticker?.change24h !== undefined ? ticker.change24h : null;
  const usdtVolume = ticker?.usdtVolume !== undefined ? ticker.usdtVolume : null;
  const isPositive = change24h !== null ? change24h >= 0 : true;

  // Local indicator override if card has specific local fx bar open
  const effectiveIndicatorConfig = {
    ...indicatorConfig,
    showTvHeader: chart.showTvHeader !== undefined ? chart.showTvHeader : indicatorConfig.showTvHeader
  };

  const handleTimeframeClick = (e, tf) => {
    e.stopPropagation();
    onUpdateChart(chart.id, { timeframe: tf });
  };

  const handleToggleLock = (e) => {
    e.stopPropagation();
    onUpdateChart(chart.id, { isLocked: !chart.isLocked });
  };

  const handleToggleLocalFx = (e) => {
    e.stopPropagation();
    onUpdateChart(chart.id, { 
      showTvHeader: chart.showTvHeader !== undefined ? !chart.showTvHeader : !indicatorConfig.showTvHeader 
    });
  };

  const handleOpenSearch = (e) => {
    e.stopPropagation();
    onOpenSearch(chart.id);
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    onToggleFavorite(cleanSymbol);
  };

  const handleToggleMaximize = (e) => {
    e.stopPropagation();
    onToggleMaximize(chart.id);
  };

  return (
    <div 
      onClick={() => onSelectSlot(index)}
      className={`flex flex-col h-full w-full bg-[#090c13] border rounded-lg overflow-hidden transition-all duration-150 relative group ${
        isMaximized 
          ? 'fixed inset-0 z-50 rounded-none border-0' 
          : isActiveSlot 
            ? 'active-slot-glow border-[#00f2fe]' 
            : 'border-white/10 hover:border-cyan-500/40'
      }`}
    >
      {/* Chart Top Header Toolbar */}
      <div className="h-8 bg-[#0d121c] border-b border-white/10 px-2 flex items-center justify-between gap-1 select-none shrink-0 text-xs">
        {/* Left: Slot Number, Ticker, Exchange & Live % Variation */}
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border transition-colors ${
            isActiveSlot 
              ? 'bg-cyan-500 text-black border-cyan-400 font-extrabold shadow-[0_0_8px_rgba(0,242,254,0.6)]' 
              : 'bg-cyan-950/80 text-cyan-400 border-cyan-700/50'
          }`}>
            #{index + 1}
          </span>

          <button
            onClick={handleOpenSearch}
            title="Cambia Crypto / Cerca Ticker Bitget"
            className="flex items-center gap-1 font-bold text-white hover:text-cyan-400 font-mono tracking-tight transition-colors py-0.5 px-1 rounded hover:bg-white/5"
          >
            <span className="text-xs">{cleanSymbol}</span>
            <span className="text-[9px] text-gray-400 font-normal">({exchange})</span>
            <Search size={11} className="text-gray-400 opacity-60 group-hover:opacity-100" />
          </button>

          {/* 24h Variation Badge */}
          {change24h !== null && (
            <div className={`flex items-center gap-0.5 px-1.5 py-0.2 rounded font-mono font-bold text-[10px] ${
              isPositive 
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40' 
                : 'bg-rose-950/80 text-rose-400 border border-rose-800/40'
            }`}>
              {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              <span>{isPositive ? '+' : ''}{change24h.toFixed(2)}%</span>
            </div>
          )}

          {/* 24h Daily Volume in USDT */}
          {usdtVolume !== null && (
            <span 
              title="Volume di scambio 24h in USDT"
              className="text-cyan-300 font-mono text-[10px] font-semibold bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 rounded shadow-[0_0_6px_rgba(0,242,254,0.15)]"
            >
              Vol: {formatVolume(usdtVolume)}
            </span>
          )}
        </div>

        {/* Center/Right: Local Timeframe Switcher */}
        <div className="flex items-center gap-1">
          <div className="flex items-center bg-black/50 p-0.5 rounded border border-white/5">
            {TIMEFRAMES.map((tf) => {
              const isActive = (chart.timeframe === tf) || 
                (tf === '1m' && chart.timeframe === '1') || 
                (tf === '5m' && chart.timeframe === '5') ||
                (tf === '15m' && chart.timeframe === '15') ||
                (tf === '30m' && chart.timeframe === '30') ||
                (tf === '1h' && chart.timeframe === '60') ||
                (tf === '4h' && chart.timeframe === '240') ||
                (tf === '1D' && (chart.timeframe === 'D' || chart.timeframe === '1d'));

              return (
                <button
                  key={tf}
                  onClick={(e) => handleTimeframeClick(e, tf)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                    isActive 
                      ? 'bg-cyan-500 text-black font-bold shadow-[0_0_6px_rgba(0,242,254,0.4)]' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tf}
                </button>
              );
            })}
          </div>

          {/* Action Buttons: fx TV Indicators Toolbar, Lock, Favorite, Fullscreen, External Link */}
          <div className="flex items-center gap-0.5 pl-1 border-l border-white/10">
            {/* Native TV Indicator Toolbar Toggle */}
            <button
              onClick={handleToggleLocalFx}
              title={effectiveIndicatorConfig.showTvHeader ? "Nascondi barra fx TradingView" : "Mostra barra fx TradingView per aggiungere altri indicatori"}
              className={`px-1 py-0.5 rounded font-mono font-black text-[10px] transition-colors ${
                effectiveIndicatorConfig.showTvHeader 
                  ? 'bg-cyan-500 text-black shadow-[0_0_6px_rgba(0,242,254,0.5)]' 
                  : 'text-gray-400 hover:text-cyan-300 hover:bg-white/5'
              }`}
            >
              fx
            </button>

            {/* Lock Toggle */}
            <button
              onClick={handleToggleLock}
              title={chart.isLocked ? "Timeframe Bloccato 🔒 (Ignora barra globale)" : "Timeframe Sbloccato 🔓 (Segue la barra globale)"}
              className={`p-1 rounded transition-colors ${
                chart.isLocked 
                  ? 'text-amber-400 bg-amber-950/70 border border-amber-500/50' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {chart.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
            </button>

            {/* Favorite Star */}
            <button
              onClick={handleToggleFavorite}
              title={chart.isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
              className={`p-1 rounded transition-colors ${
                chart.isFavorite 
                  ? 'text-yellow-400' 
                  : 'text-gray-400 hover:text-yellow-300 hover:bg-white/5'
              }`}
            >
              <Star size={12} fill={chart.isFavorite ? "#facc15" : "none"} />
            </button>

            {/* Maximize / Focus */}
            <button
              onClick={handleToggleMaximize}
              title={isMaximized ? "Riduci vista" : "Massimizza a schermo intero"}
              className="p-1 text-gray-400 hover:text-cyan-400 hover:bg-white/5 rounded transition-colors"
            >
              {isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            </button>

            {/* External TradingView Link */}
            <a
              href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(chart.symbol)}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Apri su TradingView"
              className="p-1 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
            >
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* Binance Order Flow Session Metrics Strip */}
      {binanceMetric && binanceMetric.isAvailable && (
        <div className="h-6 bg-[#080c14] border-b border-white/5 px-2 flex items-center justify-between text-[10px] font-mono select-none overflow-hidden shrink-0">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-[9px] text-amber-400 font-bold bg-amber-400/10 px-1 py-0.2 rounded border border-amber-400/20">
              BINANCE OF
            </span>
            <span 
              className={`font-bold ${binanceMetric.deltaOIPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} 
              title={`Session Open Interest: ${binanceMetric.deltaOIPercent >= 0 ? '+' : ''}${binanceMetric.deltaOIPercent.toFixed(2)}%`}
            >
              OI: {binanceMetric.deltaOIPercent >= 0 ? '▲+' : '▼'}{binanceMetric.deltaOIPercent.toFixed(1)}%
            </span>
            <span className="text-gray-600">•</span>
            <span 
              className={`font-bold ${binanceMetric.sessionCVD > 0 ? 'text-emerald-400' : binanceMetric.sessionCVD < 0 ? 'text-rose-400' : 'text-gray-400'}`} 
              title={`CVD Giornaliero (da 00:00 UTC): ${binanceMetric.sessionCVD >= 0 ? '+' : ''}${Math.round(binanceMetric.sessionCVD).toLocaleString()} contratti (${binanceMetric.sessionCVDUsd >= 0 ? '+' : ''}${formatCurrency(binanceMetric.sessionCVDUsd)} • ${binanceMetric.takerBuyPercent.toFixed(1)}% Taker Buy)`}
            >
              CVD: {formatCVD(binanceMetric.sessionCVD)}
            </span>
            <span className="text-gray-600">•</span>
            <span 
              className={`${binanceMetric.vwapDiffPercent >= -0.3 && binanceMetric.vwapDiffPercent <= 1.5 ? 'text-purple-300 font-bold' : 'text-gray-400'}`} 
              title={`Distanza da Session VWAP ($${binanceMetric.sessionVWAP.toFixed(3)})`}
            >
              VWAP: {binanceMetric.vwapDiffPercent >= 0 ? '+' : ''}{binanceMetric.vwapDiffPercent.toFixed(1)}%
            </span>
          </div>

          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider border shrink-0 ${binanceMetric.badgeColor}`}>
            {binanceMetric.badgeLabel}
          </span>
        </div>
      )}

      {/* Chart Canvas / TradingView Widget */}
      <div className="flex-1 w-full h-full relative">
        <TradingViewWidget
          symbol={chart.symbol}
          timeframe={chart.timeframe}
          indicatorConfig={effectiveIndicatorConfig}
          containerId={`chart_${chart.id}`}
        />
      </div>
    </div>
  );
};

export default ChartCard;
