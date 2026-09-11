import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, TrendingDown } from 'lucide-react';
import { formatPrice, formatVolume } from '../services/bitgetApi';

const SearchModal = ({
  isOpen = false,
  onClose,
  targetSlotId = null,
  targetSlotIndex = 0,
  tickers = [],
  onSelectSymbol
}) => {
  const [search, setSearch] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = tickers.filter(t => {
    if (!search) return true;
    const q = search.toUpperCase().trim();
    return t.symbol.includes(q) || t.baseCoin.includes(q);
  }).slice(0, 50);

  const handleSelect = (ticker) => {
    onSelectSymbol(targetSlotId, ticker);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filtered.length > 0) {
      handleSelect(filtered[0]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md glass-modal rounded-xl border border-white/15 overflow-hidden shadow-2xl flex flex-col">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-white/10 flex items-center gap-2 bg-[#0e1420]">
          <Search size={16} className="text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Cerca ticker Bitget per Slot #${targetSlotIndex + 1}...`}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none font-mono"
          />
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-xs font-mono">
              Nessun contratto Bitget trovato per "{search}".
            </div>
          ) : (
            filtered.map((t) => {
              const isPos = t.change24h >= 0;
              return (
                <div
                  key={t.symbol}
                  onClick={() => handleSelect(t)}
                  className="px-3 py-2.5 flex items-center justify-between hover:bg-cyan-950/40 cursor-pointer transition-colors group"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white font-mono group-hover:text-cyan-400">
                        {t.baseCoin}
                      </span>
                      <span className="text-[10px] text-gray-400 font-normal">/USDT (Bitget)</span>
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">
                      Vol: {formatVolume(t.usdtVolume)}
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xs text-gray-200 font-medium">
                      {formatPrice(t.lastPrice)}
                    </div>
                    <div className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${
                      isPos ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isPos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      <span>{isPos ? '+' : ''}{t.change24h.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-white/10 bg-[#090d16] text-[10px] text-gray-500 flex items-center justify-between font-mono">
          <span>Premi [Invio] per selezionare il primo risultato</span>
          <span>[Esc] per chiudere</span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
