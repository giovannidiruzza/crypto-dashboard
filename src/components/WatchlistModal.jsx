import React, { useState, useRef } from 'react';
import { 
  X, 
  Bookmark, 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  Check, 
  Sparkles,
  Layers
} from 'lucide-react';

const WatchlistModal = ({
  isOpen = false,
  onClose,
  watchlists = [],
  activeWatchlistId,
  onSelectWatchlist,
  onCreateWatchlist,
  onDeleteWatchlist,
  onImportWatchlists,
  onExportWatchlists
}) => {
  const [newListName, setNewListName] = useState('');
  const [newListSymbols, setNewListSymbols] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    const symbolsArray = newListSymbols
      .split(/[\s,]+/)
      .map(s => s.trim().toUpperCase().replace(/USDT$/, '') + 'USDT')
      .filter(s => s.length > 4);

    onCreateWatchlist(newListName.trim(), symbolsArray.length > 0 ? symbolsArray : ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']);
    setNewListName('');
    setNewListSymbols('');
    setShowCreateForm(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result);
        if (Array.isArray(json)) {
          onImportWatchlists(json);
        } else if (json.watchlists && Array.isArray(json.watchlists)) {
          onImportWatchlists(json.watchlists);
        } else {
          alert('Formato file JSON non valido.');
        }
      } catch (err) {
        alert('Errore nella lettura del file JSON.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-modal rounded-xl border border-white/15 overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0e1420]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
              <Bookmark size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Gestione Watchlist & Presets
              </h2>
              <p className="text-xs text-gray-400">
                Seleziona, crea ed esporta le tue liste di criptovalute
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

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[65vh]">
          {/* Watchlists List */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block font-mono">
              Watchlist Disponibili:
            </label>

            {watchlists.map((wl) => {
              const isSelected = activeWatchlistId === wl.id;

              return (
                <div
                  key={wl.id}
                  className={`p-3 rounded-lg border flex items-center justify-between gap-2 transition-all ${
                    isSelected 
                      ? 'bg-cyan-950/50 border-cyan-500/60 shadow-[0_0_10px_rgba(0,242,254,0.15)]' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div 
                    onClick={() => {
                      onSelectWatchlist(wl.id);
                      onClose();
                    }}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white font-mono">{wl.name}</span>
                      {isSelected && (
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.2 rounded border border-cyan-500/40 font-bold">
                          ATTIVA
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5 truncate max-w-sm">
                      {wl.isDynamic ? 'Aggiornamento dinamico da Bitget Futures' : wl.symbols.join(', ')}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        onSelectWatchlist(wl.id);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-colors"
                    >
                      Carica
                    </button>

                    {!wl.isDynamic && watchlists.length > 1 && (
                      <button
                        onClick={() => onDeleteWatchlist(wl.id)}
                        className="p-1 text-gray-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                        title="Elimina Watchlist"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Create Custom Watchlist Button / Form */}
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full py-2 px-3 rounded-lg border border-dashed border-cyan-500/40 text-cyan-400 hover:bg-cyan-950/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus size={14} />
              <span>Crea Nuova Watchlist Personalizzata</span>
            </button>
          ) : (
            <form onSubmit={handleCreate} className="p-3 bg-black/40 rounded-lg border border-cyan-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">Nuova Watchlist</span>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Nome Watchlist (es. DeFi Moonshots, Scalping 1m)..."
                className="w-full px-2.5 py-1.5 text-xs bg-black/60 border border-white/15 rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono"
                required
              />

              <textarea
                value={newListSymbols}
                onChange={(e) => setNewListSymbols(e.target.value)}
                placeholder="Simboli separati da spazio o virgola (es. BTC, ETH, SOL, SUI, PEPE)..."
                rows={2}
                className="w-full px-2.5 py-1.5 text-xs bg-black/60 border border-white/15 rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-3 py-1 rounded text-xs text-gray-400 hover:text-white"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400"
                >
                  Salva Watchlist
                </button>
              </div>
            </form>
          )}

          {/* Import / Export Section */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <button
              onClick={onExportWatchlists}
              className="flex-1 py-1.5 px-2.5 rounded-md bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-cyan-500/30 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download size={13} className="text-cyan-400" />
              <span>Esporta JSON</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-1.5 px-2.5 rounded-md bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-cyan-500/30 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
            >
              <Upload size={13} className="text-emerald-400" />
              <span>Importa JSON</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-[#090d16] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

export default WatchlistModal;
