import React from 'react';
import { 
  Flame, 
  Layers, 
  Grid, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Clock, 
  Bookmark,
  TrendingUp
} from 'lucide-react';

const TIMEFRAMES = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '30m', value: '30m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '12h', value: '12h' },
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' }
];

const LAYOUTS = [
  { id: '1x1', label: '1', icon: '1×1', desc: '1 Grafico Singolo' },
  { id: '2x2', label: '4', icon: '2×2', desc: '4 Grafici (2×2)' },
  { id: '3x2', label: '6', icon: '3×2', desc: '6 Grafici (3×2)' },
  { id: '3x3', label: '9', icon: '3×3', desc: '9 Grafici (3×3) Predefinito' },
  { id: '4x3', label: '12', icon: '4×3', desc: '12 Grafici (4×3)' },
  { id: '4x4', label: '16', icon: '4×4', desc: '16 Grafici (4×4)' }
];

const Header = ({
  globalTimeframe = '5m',
  layout = '3x3',
  countdowns = {},
  isMuted = true,
  isDrawerOpen = false,
  isRefreshing = false,
  pollingCountdown = 15,
  activeWatchlistName = '🔥 Bitget Top Gainers',
  onSetGlobalTimeframe,
  onSetLayout,
  onToggleDrawer,
  onToggleMute,
  onOpenIndicators,
  onOpenWatchlists,
  onManualRefresh
}) => {
  return (
    <header className="h-12 bg-[#090c14] border-b border-white/10 px-3 flex items-center justify-between gap-2 select-none shrink-0 z-30 shadow-lg">
      {/* Left: Brand Logo + Scanner Drawer & Watchlists Triggers */}
      <div className="flex items-center gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2 pr-2 border-r border-white/10">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_12px_rgba(0,242,254,0.4)]">
            <TrendingUp size={16} className="text-black font-black" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1 font-mono">
              BULL<span className="text-cyan-400">DASH</span>
            </span>
            <span className="text-[8px] text-gray-400 font-mono tracking-widest leading-none">
              BITGET FUTURES
            </span>
          </div>
        </div>

        {/* Scanner Drawer Toggle */}
        <button
          onClick={onToggleDrawer}
          title="Apri Scanner Futures Bitget & Top Gainers"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${
            isDrawerOpen 
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(0,242,254,0.2)]' 
              : 'bg-white/5 hover:bg-white/10 text-gray-200 border-white/10 hover:border-cyan-500/30'
          }`}
        >
          <Flame size={14} className="text-amber-400 animate-pulse" />
          <span className="hidden sm:inline">Scanner Gainers</span>
        </button>

        {/* Watchlist Manager Button */}
        <button
          onClick={onOpenWatchlists}
          title="Gestisci Watchlists & Preset"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 hover:border-cyan-500/30 transition-all"
        >
          <Bookmark size={13} className="text-cyan-400" />
          <span className="hidden md:inline max-w-[130px] truncate">{activeWatchlistName}</span>
        </button>
      </div>

      {/* Center: Candle Countdown Timers Bar + Sound Alert Toggle */}
      <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono mr-1 hidden lg:flex">
          <Clock size={12} className="text-cyan-400" />
          <span>CHIUSURA:</span>
        </div>

        {/* Countdown Badges */}
        {['5m', '15m', '1h', '4h'].map((tf) => {
          const timer = countdowns[tf];
          const isNear = timer?.isNearClose;

          return (
            <div
              key={tf}
              title={`Tempo rimanente chiusura candela ${tf}`}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border transition-colors ${
                isNear 
                  ? 'animate-candle-alert text-rose-400 font-bold border-rose-500/50' 
                  : 'bg-white/5 text-gray-300 border-white/5'
              }`}
            >
              <span className="text-gray-400 font-normal">{tf}:</span>
              <span>{timer?.formatted || '--'}</span>
            </div>
          );
        })}

        {/* Audio Mute/Unmute Button */}
        <button
          onClick={onToggleMute}
          title={isMuted ? "Attiva Alert Sonoro Chiusura Candela (Mute attivo)" : "Disattiva Alert Sonoro Chiusura Candela (Audio attivo)"}
          className={`p-1 rounded transition-colors ml-0.5 ${
            isMuted 
              ? 'text-gray-500 hover:text-gray-300 bg-white/5' 
              : 'text-cyan-400 bg-cyan-950/80 border border-cyan-500/40 shadow-[0_0_8px_rgba(0,242,254,0.4)]'
          }`}
        >
          {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>
      </div>

      {/* Right: Global Timeframe Broadcast, Indicators Modal, Layout Switcher & Refresh */}
      <div className="flex items-center gap-2">
        {/* Global Timeframe Bar */}
        <div className="flex items-center bg-black/60 p-0.5 rounded-md border border-white/10">
          <span className="text-[9px] text-gray-400 font-mono uppercase px-1 hidden xl:inline">
            Global:
          </span>
          {TIMEFRAMES.map((tf) => {
            const isActive = globalTimeframe === tf.value;
            return (
              <button
                key={tf.value}
                onClick={() => onSetGlobalTimeframe(tf.value)}
                title={`Imposta timeframe ${tf.label} su tutti i grafici sbloccati`}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  isActive 
                    ? 'bg-cyan-500 text-black font-extrabold shadow-[0_0_8px_rgba(0,242,254,0.5)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tf.label}
              </button>
            );
          })}
        </div>

        {/* Indicators Manager Trigger */}
        <button
          onClick={onOpenIndicators}
          title="Configura & Sincronizza Indicatori (EMA Ribbon, Bollinger, RSI, MACD)"
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-white/5 hover:bg-white/10 text-cyan-400 border border-white/10 hover:border-cyan-500/40 transition-all"
        >
          <Sliders size={13} />
          <span className="hidden sm:inline">Indicatori</span>
        </button>

        {/* Layout Grid Selector */}
        <div className="flex items-center bg-black/50 p-0.5 rounded-md border border-white/10">
          {LAYOUTS.map((ly) => {
            const isActive = layout === ly.id;
            return (
              <button
                key={ly.id}
                onClick={() => onSetLayout(ly.id)}
                title={ly.desc}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                  isActive 
                    ? 'bg-cyan-500 text-black shadow-[0_0_6px_rgba(0,242,254,0.4)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {ly.label}
              </button>
            );
          })}
        </div>

        {/* Live Polling Sync / Manual Reload */}
        <button
          onClick={onManualRefresh}
          disabled={isRefreshing}
          title={`Sincronizza Dati Bitget (Auto in ${pollingCountdown}s)`}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-cyan-500/30 transition-all"
        >
          <RefreshCw 
            size={12} 
            className={`text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} 
          />
          <span className="text-[10px] text-gray-400 hidden md:inline">{pollingCountdown}s</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
