import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Flame, 
  TrendingDown, 
  BarChart2, 
  ArrowUpDown, 
  Star, 
  Zap,
  Filter,
  Check,
  Target,
  Activity,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { formatPrice, formatVolume } from '../services/bitgetApi';
import { formatCurrency, formatCVD, normalizeBinanceSymbol } from '../services/binanceFuturesApi';

const VOLUME_FILTERS = [
  { label: 'Tutti i Volumi', value: 0 },
  { label: '> $500K', value: 500_000 },
  { label: '> $1M', value: 1_000_000 },
  { label: '> $5M', value: 5_000_000 },
  { label: '> $10M', value: 10_000_000 },
  { label: '> $50M', value: 50_000_000 }
];

const PULLBACK_SUBFILTERS = [
  { id: 'ALL', label: 'Tutti' },
  { id: 'PULLBACK_READY', label: '🎯 Pullback Ready' },
  { id: 'TREND_EXTENDED', label: '🚀 Trend Esteso' },
  { id: 'DIVERGENT', label: '⚠️ Divergenze CVD' },
  { id: 'OI_UNWINDING', label: '🔴 OI Drop' }
];

const ScannerDrawer = ({
  isOpen = false,
  onClose,
  tickers = [],
  binanceMetrics = {},
  onRefreshMetrics,
  isLoadingMetrics = false,
  activeSlotIndex = 0,
  gridSlotsCount = 9,
  favorites = [],
  onSelectTickerForSlot,
  onLoadTopGainersToGrid,
  onToggleFavorite
}) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('pullback'); // 'pullback', 'gainers', 'losers', 'volume', 'alpha', 'favorites'
  const [pullbackSubfilter, setPullbackSubfilter] = useState('ALL');
  const [minVolume, setMinVolume] = useState(1_000_000); // Default >$1M to filter junk illiquid coins

  // Filter & sort tickers
  const filteredTickers = useMemo(() => {
    let result = tickers.filter(t => {
      // Search filter
      if (search) {
        const q = search.toUpperCase().trim();
        if (!t.symbol.includes(q) && !t.baseCoin.includes(q)) {
          return false;
        }
      }

      // Min volume filter
      if (minVolume > 0 && t.usdtVolume < minVolume) {
        return false;
      }

      // Favorites only tab
      if (sortBy === 'favorites' && !favorites.includes(t.baseCoin) && !favorites.includes(t.symbol)) {
        return false;
      }

      // Pullback subfilter
      if (sortBy === 'pullback' && pullbackSubfilter !== 'ALL') {
        const bSym = normalizeBinanceSymbol(t.symbol);
        const m = binanceMetrics[bSym];
        if (!m || !m.isAvailable) return false;
        if (pullbackSubfilter === 'PULLBACK_READY' && m.setup !== 'PULLBACK_READY') return false;
        if (pullbackSubfilter === 'TREND_EXTENDED' && m.setup !== 'TREND_EXTENDED') return false;
        if (pullbackSubfilter === 'DIVERGENT' && m.setup !== 'DIVERGENT') return false;
        if (pullbackSubfilter === 'OI_UNWINDING' && m.setup !== 'OI_UNWINDING') return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'pullback') {
      const top10 = [...result]
        .sort((a, b) => b.change24h - a.change24h)
        .slice(0, 10);

      let pullbackFiltered = top10.filter(t => {
        if (pullbackSubfilter === 'ALL') return true;
        const bSym = normalizeBinanceSymbol(t.symbol);
        const m = binanceMetrics[bSym];
        if (!m || !m.isAvailable) return false;
        return m.setup === pullbackSubfilter;
      });

      pullbackFiltered.sort((a, b) => {
        const bSymA = normalizeBinanceSymbol(a.symbol);
        const bSymB = normalizeBinanceSymbol(b.symbol);
        const scoreA = binanceMetrics[bSymA]?.compositeScore ?? -999;
        const scoreB = binanceMetrics[bSymB]?.compositeScore ?? -999;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return b.change24h - a.change24h;
      });

      return pullbackFiltered;
    } else if (sortBy === 'gainers') {
      result.sort((a, b) => b.change24h - a.change24h);
    } else if (sortBy === 'losers') {
      result.sort((a, b) => a.change24h - b.change24h);
    } else if (sortBy === 'volume') {
      result.sort((a, b) => b.usdtVolume - a.usdtVolume);
    } else if (sortBy === 'alpha') {
      result.sort((a, b) => a.symbol.localeCompare(b.symbol));
    } else if (sortBy === 'favorites') {
      result.sort((a, b) => b.change24h - a.change24h);
    }

    return result;
  }, [tickers, search, sortBy, pullbackSubfilter, minVolume, favorites, binanceMetrics]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-84 sm:w-[420px] bg-[#080c14] border-r border-white/15 shadow-[10px_0_30px_rgba(0,0,0,0.8)] flex flex-col transition-all duration-300 animate-in slide-in-from-left">
      {/* Drawer Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between bg-[#0e1420]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
            <Flame size={15} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 font-mono">
              Scanner Futures <span className="text-amber-400 text-xs px-1 rounded bg-amber-400/10 border border-amber-400/30">Binance OF</span>
            </h2>
            <p className="text-[10px] text-gray-400">
              {sortBy === 'pullback' ? 'Top 10 Gainers analizzati' : `${filteredTickers.length} contratti trovati`} (CVD + OI + VWAP)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onRefreshMetrics && (
            <button
              onClick={onRefreshMetrics}
              disabled={isLoadingMetrics}
              title="Ricalcola Order Flow Binance (OI e CVD)"
              className="p-1 rounded-md text-gray-400 hover:text-cyan-400 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={15} className={isLoadingMetrics ? 'animate-spin text-cyan-400' : ''} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 1-Click Load Action Bar */}
      <div className="p-2.5 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border-b border-cyan-500/30 flex items-center justify-between gap-2">
        <div className="text-[11px] text-cyan-200">
          Slot attivo: <span className="font-bold text-cyan-400 font-mono">#{activeSlotIndex + 1}</span>
        </div>
        <button
          onClick={() => {
            onLoadTopGainersToGrid(filteredTickers.slice(0, gridSlotsCount));
            onClose();
          }}
          title="Riempi automaticamente gli slot della griglia con i migliori token di questa lista"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-[0_0_12px_rgba(0,242,254,0.4)] transition-all"
        >
          <Zap size={13} className="fill-black" />
          <span>Carica Top {gridSlotsCount}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-2 border-b border-white/10 bg-[#0b0f19]">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-2.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca token (es. BTC, SOL, TRUMP)..."
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-black/60 border border-white/10 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 text-gray-400 hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Sort Tabs */}
      <div className="p-1.5 bg-[#090d16] border-b border-white/10 flex items-center justify-between gap-1 text-[11px]">
        {/* Pullback Radar Tab */}
        <button
          onClick={() => setSortBy('pullback')}
          className={`flex-1 py-1 px-1 rounded flex items-center justify-center gap-1 font-medium transition-all ${
            sortBy === 'pullback' 
              ? 'bg-gradient-to-r from-amber-500/25 to-emerald-500/25 text-amber-300 border border-amber-400/50 font-bold shadow-[0_0_8px_rgba(245,158,11,0.2)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Target size={12} className={sortBy === 'pullback' ? 'text-amber-400' : ''} />
          <span>Radar Pullback</span>
        </button>

        <button
          onClick={() => setSortBy('gainers')}
          className={`flex-1 py-1 px-1 rounded flex items-center justify-center gap-1 font-medium transition-all ${
            sortBy === 'gainers' 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Flame size={12} />
          <span>Gainers</span>
        </button>

        <button
          onClick={() => setSortBy('losers')}
          className={`flex-1 py-1 px-1 rounded flex items-center justify-center gap-1 font-medium transition-all ${
            sortBy === 'losers' 
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <TrendingDown size={12} />
          <span>Losers</span>
        </button>

        <button
          onClick={() => setSortBy('volume')}
          className={`flex-1 py-1 px-1 rounded flex items-center justify-center gap-1 font-medium transition-all ${
            sortBy === 'volume' 
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BarChart2 size={12} />
          <span>Volume</span>
        </button>

        <button
          onClick={() => setSortBy('favorites')}
          className={`py-1 px-2 rounded flex items-center justify-center gap-1 font-medium transition-all ${
            sortBy === 'favorites' 
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 font-bold' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Star size={12} />
        </button>
      </div>

      {/* Subfilters when Pullback Radar is selected */}
      {sortBy === 'pullback' && (
        <div className="px-2 py-1.5 bg-[#0a0f1d] border-b border-amber-500/20 flex items-center gap-1 overflow-x-auto text-[10px]">
          {PULLBACK_SUBFILTERS.map(sub => (
            <button
              key={sub.id}
              onClick={() => setPullbackSubfilter(sub.id)}
              className={`px-2 py-0.5 rounded whitespace-nowrap font-mono transition-all ${
                pullbackSubfilter === sub.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}

      {/* Liquidity / Volume Filter Pills */}
      <div className="px-2 py-1 bg-[#070a10] border-b border-white/5 flex items-center gap-1 overflow-x-auto text-[10px]">
        <span className="text-gray-500 text-[9px] shrink-0 uppercase font-mono">Vol 24h:</span>
        {VOLUME_FILTERS.map(vf => (
          <button
            key={vf.value}
            onClick={() => setMinVolume(vf.value)}
            className={`px-1.5 py-0.5 rounded shrink-0 transition-colors font-mono ${
              minVolume === vf.value 
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {vf.label}
          </button>
        ))}
      </div>

      {/* Token List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/5">
        {filteredTickers.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs">
            Nessun contratto trovato per i filtri selezionati.
          </div>
        ) : (
          filteredTickers.map((t, idx) => {
            const isPos = t.change24h >= 0;
            const isFav = favorites.includes(t.baseCoin) || favorites.includes(t.symbol);
            const bSym = normalizeBinanceSymbol(t.symbol);
            const metric = binanceMetrics[bSym] || null;

            return (
              <div
                key={t.symbol}
                onClick={() => {
                  onSelectTickerForSlot(t, activeSlotIndex);
                }}
                className="px-3 py-2 flex flex-col gap-1.5 hover:bg-cyan-950/20 cursor-pointer transition-colors group select-none"
              >
                {/* Top Row: Rank, Symbol, Volume & Price / 24h */}
                <div className="flex items-center justify-between">
                  {/* Left: Rank, Symbol & Volume */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-500 w-5 text-right">
                      #{idx + 1}
                    </span>

                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-xs text-white group-hover:text-cyan-400 font-mono transition-colors">
                          {t.baseCoin}
                        </span>
                        <span className="text-[9px] text-gray-400 font-normal">/USDT</span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        Vol: {formatVolume(t.usdtVolume)}
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & 24h Variation Badge + Star */}
                  <div className="flex items-center gap-2">
                    <div className="text-right font-mono">
                      <div className="text-xs text-gray-200 font-semibold">
                        {formatPrice(t.lastPrice)}
                      </div>
                      <div className={`text-[10px] font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPos ? '+' : ''}{t.change24h.toFixed(2)}%
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(t.baseCoin);
                      }}
                      className="p-1 text-gray-500 hover:text-yellow-400 transition-colors"
                    >
                      <Star size={13} fill={isFav ? "#facc15" : "none"} className={isFav ? "text-yellow-400" : ""} />
                    </button>
                  </div>
                </div>

                {/* Bottom Row: Binance Order Flow Metrics & Badge */}
                {metric && metric.isAvailable && (
                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/5 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      {/* Session OI */}
                      <span 
                        title={`Session Open Interest: ${formatCurrency(metric.currentOIUsd)} (${metric.deltaOIPercent >= 0 ? '+' : ''}${metric.deltaOIPercent.toFixed(2)}%)`}
                        className={`px-1 py-0.2 rounded font-bold ${
                          metric.deltaOIPercent > 1 
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40' 
                            : metric.deltaOIPercent < -1 
                              ? 'bg-rose-950/80 text-rose-400 border border-rose-800/40'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        OI: {metric.deltaOIPercent >= 0 ? '▲+' : '▼'}{metric.deltaOIPercent.toFixed(1)}%
                      </span>

                      {/* Session CVD & Taker Buy % */}
                      <span 
                        title={`CVD Giornaliero (da 00:00 UTC): ${metric.sessionCVD >= 0 ? '+' : ''}${Math.round(metric.sessionCVD).toLocaleString()} contratti (${metric.sessionCVDUsd >= 0 ? '+' : ''}${formatCurrency(metric.sessionCVDUsd)} • ${metric.takerBuyPercent.toFixed(1)}% Taker Buy)`}
                        className={`px-1 py-0.2 rounded font-bold border ${
                          metric.sessionCVD > 0
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/40'
                            : metric.sessionCVD < 0
                            ? 'bg-rose-950/80 text-rose-400 border-rose-800/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        CVD: {formatCVD(metric.sessionCVD)}
                      </span>

                      {/* Distance from VWAP */}
                      <span 
                        title={`Prezzo vs VWAP: ${metric.vwapDiffPercent >= 0 ? '+' : ''}${metric.vwapDiffPercent.toFixed(2)}% (VWAP: $${metric.sessionVWAP.toFixed(3)})`}
                        className={`px-1 py-0.2 rounded ${
                          metric.vwapDiffPercent >= -0.2 && metric.vwapDiffPercent <= 1.5
                            ? 'bg-purple-950/80 text-purple-300 border border-purple-700/50 font-bold'
                            : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        VWAP: {metric.vwapDiffPercent >= 0 ? '+' : ''}{metric.vwapDiffPercent.toFixed(1)}%
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border shrink-0 ${metric.badgeColor}`}>
                      {metric.badgeLabel}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2 border-t border-white/10 bg-[#0a0e16] text-[10px] text-gray-500 flex items-center justify-between font-mono">
        <span>Click sul token: carica nello slot #{activeSlotIndex + 1}</span>
        <span className="text-amber-400/80 text-[9px]">Dati OF: Binance Futures</span>
      </div>
    </div>
  );
};

export default ScannerDrawer;

