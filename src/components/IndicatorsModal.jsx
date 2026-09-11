import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Check, 
  Sliders, 
  Sparkles, 
  Search, 
  Plus, 
  CheckCircle2
} from 'lucide-react';
import { 
  TV_INDICATORS_LIBRARY, 
  TV_INDICATOR_CATEGORIES, 
  UNIVERSAL_INDICATOR_PRESETS 
} from '../services/tradingViewIndicators';

const IndicatorsModal = ({
  isOpen = false,
  onClose,
  indicatorConfig,
  onApplyIndicators
}) => {
  // 1. All hooks at the very top level
  const [activeIds, setActiveIds] = useState(() => {
    if (Array.isArray(indicatorConfig?.activeIndicatorIds)) {
      return indicatorConfig.activeIndicatorIds;
    }
    return ['ema20', 'ema50', 'ema100', 'ema200', 'volume'];
  });

  const [customInputs, setCustomInputs] = useState(() => indicatorConfig?.customInputs || {
    ema20: { length: 20 },
    ema50: { length: 50 },
    ema100: { length: 100 },
    ema200: { length: 200 },
    atr: { length: 14 }
  });

  const [showTvHeader, setShowTvHeader] = useState(!!indicatorConfig?.showTvHeader);
  const [selectedPresetName, setSelectedPresetName] = useState(indicatorConfig?.presetName || 'Personalizzato');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Sync state when modal opens or indicatorConfig changes
  useEffect(() => {
    if (isOpen && indicatorConfig) {
      if (Array.isArray(indicatorConfig.activeIndicatorIds)) {
        setActiveIds(indicatorConfig.activeIndicatorIds);
      }
      if (indicatorConfig.customInputs) {
        setCustomInputs(indicatorConfig.customInputs);
      }
      setShowTvHeader(!!indicatorConfig.showTvHeader);
      setSelectedPresetName(indicatorConfig.presetName || 'Personalizzato');
    }
  }, [isOpen, indicatorConfig]);

  // Filter indicators library by search and category
  const filteredLibrary = useMemo(() => {
    return TV_INDICATORS_LIBRARY.filter(ind => {
      // Category filter
      if (activeCategory !== 'all' && ind.category !== activeCategory) {
        return false;
      }

      // Search filter
      if (search) {
        const q = search.toLowerCase().trim();
        const matchesName = ind.name.toLowerCase().includes(q);
        const matchesDesc = ind.description.toLowerCase().includes(q);
        const matchesId = ind.id.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesId) {
          return false;
        }
      }

      return true;
    });
  }, [search, activeCategory]);

  // Early return ONLY after all hooks are executed
  if (!isOpen) return null;

  const handleToggleIndicator = (id) => {
    setActiveIds(prev => {
      const next = prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id];
      setSelectedPresetName('Personalizzato');
      return next;
    });
  };

  const handleApplyPreset = (preset) => {
    setActiveIds(preset.activeIds);
    setSelectedPresetName(preset.name);
  };

  const handleClearAll = () => {
    setActiveIds([]);
    setSelectedPresetName('Nessun indicatore');
  };

  const handleSaveAndApply = () => {
    const newConfig = {
      presetName: selectedPresetName,
      activeIndicatorIds: activeIds,
      customInputs: customInputs,
      showTvHeader: showTvHeader,
      // Backward compatibility fields
      ema20: { enabled: activeIds.includes('ema20'), period: customInputs.ema20?.length || 20 },
      ema50: { enabled: activeIds.includes('ema50'), period: customInputs.ema50?.length || 50 },
      ema100: { enabled: activeIds.includes('ema100'), period: customInputs.ema100?.length || 100 },
      ema200: { enabled: activeIds.includes('ema200'), period: customInputs.ema200?.length || 200 },
      vwap: { enabled: activeIds.includes('vwap'), stdDev1: true, stdDev2: true, stdDev3: true },
      atr: { enabled: activeIds.includes('atr'), period: customInputs.atr?.length || 14 },
      volume: { enabled: activeIds.includes('volume') },
      bollingerBands: { enabled: activeIds.includes('bollinger_bands') },
      rsi: { enabled: activeIds.includes('rsi') },
      macd: { enabled: activeIds.includes('macd') }
    };

    onApplyIndicators(newConfig);
    onClose();
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'trend': return 'bg-amber-950/60 text-amber-400 border-amber-500/40';
      case 'momentum': return 'bg-purple-950/60 text-purple-400 border-purple-500/40';
      case 'volatility': return 'bg-rose-950/60 text-rose-400 border-rose-500/40';
      case 'volume': return 'bg-cyan-950/60 text-cyan-400 border-cyan-500/40';
      default: return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl glass-modal rounded-xl border border-white/15 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0e1420]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
              <Sliders size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 font-mono">
                Libreria Indicatori <span className="text-cyan-400">TradingView</span>
              </h2>
              <p className="text-xs text-gray-400">
                Seleziona qualsiasi indicatore: verrà applicato a tutti i grafici della griglia
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Quick Presets Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1 font-mono">
                <Sparkles size={13} className="text-amber-400" />
                <span>Preset Veloci:</span>
              </label>
              {activeIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] text-gray-400 hover:text-rose-400 font-mono transition-colors"
                >
                  Rimuovi tutti
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {UNIVERSAL_INDICATOR_PRESETS.map((preset) => {
                const isSelected = selectedPresetName === preset.name;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      isSelected 
                        ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-[0_0_10px_rgba(0,242,254,0.25)]' 
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span className="truncate">{preset.name}</span>
                      {isSelected && <Check size={14} className="text-cyan-400 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Indicators Selected Chips */}
          <div className="p-3 bg-[#0a0e16] rounded-lg border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 font-mono flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-cyan-400" />
                <span>Indicatori Attivi sulla Griglia ({activeIds.length}):</span>
              </span>
            </div>

            {activeIds.length === 0 ? (
              <p className="text-xs text-gray-500 italic">
                Nessun indicatore selezionato. Clicca sugli indicatori qui sotto per aggiungerli.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {activeIds.map((id) => {
                  const item = TV_INDICATORS_LIBRARY.find(ind => ind.id === id);
                  if (!item) return null;

                  return (
                    <div
                      key={id}
                      className="px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_8px_rgba(0,242,254,0.2)] animate-in zoom-in-95 duration-100"
                    >
                      <span>{item.name.split('(')[0].trim()}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleIndicator(id)}
                        className="p-0.5 hover:text-white text-cyan-400 hover:bg-cyan-900/50 rounded"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search & Category Filter */}
          <div className="space-y-2">
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-3 text-cyan-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca nella libreria TradingView (es. VWAP, ATR, RSI, Supertrend, Ichimoku)..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-black/60 border border-white/15 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 text-gray-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {TV_INDICATOR_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-md shrink-0 font-medium transition-colors ${
                    activeCategory === cat.id 
                      ? 'bg-cyan-500 text-black font-bold shadow-[0_0_8px_rgba(0,242,254,0.3)]' 
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Library Grid */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2">
              {filteredLibrary.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs font-mono">
                  Nessun indicatore trovato per "{search}".
                </div>
              ) : (
                filteredLibrary.map((item) => {
                  const isActive = activeIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleIndicator(item.id)}
                      className={`p-3 rounded-lg border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isActive 
                          ? 'bg-cyan-950/40 border-cyan-500/70 shadow-[0_0_12px_rgba(0,242,254,0.15)]' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Left: Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white font-mono">{item.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono uppercase ${getCategoryBadgeClass(item.category)}`}>
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                          {item.description}
                        </p>
                      </div>

                      {/* Right: Toggle Button */}
                      <div className="shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleIndicator(item.id);
                          }}
                          className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold transition-all flex items-center gap-1 ${
                            isActive 
                              ? 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(0,242,254,0.4)]' 
                              : 'bg-white/10 text-gray-300 hover:bg-cyan-500 hover:text-black'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <Check size={13} />
                              <span>Attivo</span>
                            </>
                          ) : (
                            <>
                              <Plus size={13} />
                              <span>Aggiungi</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Toggle Native TV Header Bar Option */}
          <div className="p-3 bg-gradient-to-r from-blue-950/40 to-cyan-950/40 rounded-lg border border-cyan-500/30 flex items-center justify-between cursor-pointer">
            <div 
              onClick={() => setShowTvHeader(!showTvHeader)} 
              className="flex items-center gap-2 flex-1"
            >
              <div className="w-5 h-5 rounded bg-cyan-500 text-black font-black text-[10px] flex items-center justify-center font-mono">
                fx
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Mostra toolbar nativa TradingView (Pulsante "fx Indicatori")
                </span>
                <span className="text-[10px] text-cyan-300">
                  Mostra la barra standard in cima a ogni grafico per interagire direttamente con la libreria interna di TradingView
                </span>
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={showTvHeader} 
              onChange={() => setShowTvHeader(!showTvHeader)} 
              className="accent-cyan-400 cursor-pointer w-4 h-4"
            />
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3 border-t border-white/10 bg-[#090d16] flex items-center justify-between gap-2">
          <div className="text-[11px] text-gray-400 font-mono hidden sm:block">
            {activeIds.length} indicatori selezionati per la sincronizzazione globale
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-md text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Annulla
            </button>

            <button
              onClick={handleSaveAndApply}
              className="px-5 py-1.5 rounded-md bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-[0_0_14px_rgba(0,242,254,0.4)] transition-all flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>Applica a Tutti i Grafici</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndicatorsModal;
