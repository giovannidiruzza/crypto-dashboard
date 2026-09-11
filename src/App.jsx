import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Header from './components/Header';
import ChartGrid from './components/ChartGrid';
import ScannerDrawer from './components/ScannerDrawer';
import IndicatorsModal from './components/IndicatorsModal';
import WatchlistModal from './components/WatchlistModal';
import SearchModal from './components/SearchModal';

import { fetchBitgetFuturesTickers } from './services/bitgetApi';
import { getCandleCountdowns } from './services/candleTimer';
import soundAlerts from './services/soundAlerts';
import { 
  loadStoredData, 
  saveLayout, 
  saveCharts, 
  saveIndicators, 
  saveWatchlists, 
  saveFavorites 
} from './services/storage';
import { batchFetchBinanceMetrics, normalizeBinanceSymbol } from './services/binanceFuturesApi';

const LAYOUT_SLOT_COUNTS = {
  '1x1': 1,
  '2x2': 4,
  '3x2': 6,
  '3x3': 9,
  '4x3': 12,
  '4x4': 16
};

function App() {
  // Load initial state from LocalStorage
  const initialData = useMemo(() => loadStoredData(), []);

  const [layout, setLayout] = useState(initialData.layout || '3x3');
  const [charts, setCharts] = useState(initialData.charts);
  const [indicatorConfig, setIndicatorConfig] = useState(initialData.indicators);
  const [watchlists, setWatchlists] = useState(initialData.watchlists);
  const [activeWatchlistId, setActiveWatchlistId] = useState(initialData.watchlists[0]?.id || 'top_gainers_bitget');
  const [favorites, setFavorites] = useState(initialData.favorites || []);

  // UI State
  const [globalTimeframe, setGlobalTimeframe] = useState('5m');
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [maximizedChartId, setMaximizedChartId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isIndicatorsOpen, setIsIndicatorsOpen] = useState(false);
  const [isWatchlistsOpen, setIsWatchlistsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [searchModal, setSearchModal] = useState({ isOpen: false, targetSlotId: null, targetSlotIndex: 0 });

  // Live Market & Countdown Data
  const [tickers, setTickers] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pollingCountdown, setPollingCountdown] = useState(15);
  const [countdowns, setCountdowns] = useState(() => getCandleCountdowns());

  // Binance Order Flow & Session Metrics
  const [binanceMetrics, setBinanceMetrics] = useState({});
  const [isLoadingBinanceMetrics, setIsLoadingBinanceMetrics] = useState(false);

  const pollingRef = useRef(15);

  // Fast map lookup for ticker data
  const liveTickerMap = useMemo(() => {
    const map = {};
    tickers.forEach(t => {
      map[t.symbol] = t;
      map[t.baseCoin] = t;
    });
    return map;
  }, [tickers]);

  // Fetch Bitget Tickers
  const loadMarketData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchBitgetFuturesTickers();
      setTickers(data);
    } catch (e) {
      console.error('Error fetching market data:', e);
    } finally {
      setIsRefreshing(false);
      pollingRef.current = 15;
      setPollingCountdown(15);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadMarketData();
  }, [loadMarketData]);

  // 1-Second Timer for Candle Countdowns, Sound Alerts & 15s Polling
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const updatedCountdowns = getCandleCountdowns(now);
      setCountdowns(updatedCountdowns);

      // Check audio alerts
      soundAlerts.checkAndTriggerAlert(updatedCountdowns);

      // Polling decrement
      pollingRef.current -= 1;
      if (pollingRef.current <= 0) {
        pollingRef.current = 15;
        loadMarketData();
      }
      setPollingCountdown(pollingRef.current);
    }, 1000);

    return () => clearInterval(timer);
  }, [loadMarketData]);

  // Batch load Binance order flow metrics
  const loadBinanceOrderFlow = useCallback(async (symbolsToFetch) => {
    if (!symbolsToFetch || symbolsToFetch.length === 0) return;
    setIsLoadingBinanceMetrics(true);
    try {
      await batchFetchBinanceMetrics(symbolsToFetch, (symbol, metric) => {
        setBinanceMetrics(prev => ({
          ...prev,
          [symbol]: metric
        }));
      });
    } catch (e) {
      console.error('Error fetching Binance order flow:', e);
    } finally {
      setIsLoadingBinanceMetrics(false);
    }
  }, []);

  // Update Binance metrics for visible grid charts whenever layout or charts change
  useEffect(() => {
    const visibleCount = LAYOUT_SLOT_COUNTS[layout] || 9;
    const chartSymbols = charts.slice(0, visibleCount).map(c => c.symbol);
    loadBinanceOrderFlow(chartSymbols);
  }, [charts, layout, loadBinanceOrderFlow]);

  // When ScannerDrawer is open, fetch order flow strictly for Top 10 Gainers
  useEffect(() => {
    if (isDrawerOpen && tickers.length > 0) {
      const top10Gainers = [...tickers]
        .filter(t => t.usdtVolume >= 1_000_000)
        .sort((a, b) => b.change24h - a.change24h)
        .slice(0, 10)
        .map(t => t.symbol);
      loadBinanceOrderFlow(top10Gainers);
    }
  }, [isDrawerOpen, tickers, loadBinanceOrderFlow]);

  // Save changes to LocalStorage
  useEffect(() => {
    saveLayout(layout);
  }, [layout]);

  useEffect(() => {
    saveCharts(charts);
  }, [charts]);

  useEffect(() => {
    saveIndicators(indicatorConfig);
  }, [indicatorConfig]);

  useEffect(() => {
    saveWatchlists(watchlists);
  }, [watchlists]);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  // Broadcast Global Timeframe to unlocked charts
  const handleSetGlobalTimeframe = (tf) => {
    setGlobalTimeframe(tf);
    setCharts(prevCharts => 
      prevCharts.map(c => c.isLocked ? c : { ...c, timeframe: tf })
    );
  };

  // Update a single chart card
  const handleUpdateChart = (chartId, updates) => {
    setCharts(prev => prev.map(c => c.id === chartId ? { ...c, ...updates } : c));
  };

  // Select slot
  const handleSelectSlot = (slotIndex) => {
    setActiveSlotIndex(slotIndex);
  };

  // Toggle Maximize / Fullscreen on chart
  const handleToggleMaximize = (chartId) => {
    setMaximizedChartId(prev => prev === chartId ? null : chartId);
  };

  // Toggle Favorites
  const handleToggleFavorite = (coinSymbol) => {
    setFavorites(prev => {
      const clean = coinSymbol.toUpperCase();
      const next = prev.includes(clean) ? prev.filter(s => s !== clean) : [...prev, clean];
      return next;
    });

    // Also update favorite state inside charts
    setCharts(prev => prev.map(c => {
      if (c.baseCoin === coinSymbol || c.symbol.includes(coinSymbol)) {
        return { ...c, isFavorite: !c.isFavorite };
      }
      return c;
    }));
  };

  // Assign a ticker from Scanner or Search to target slot
  const handleAssignTickerToSlot = (ticker, slotIndex = activeSlotIndex) => {
    if (slotIndex < 0 || slotIndex >= charts.length) return;

    const targetChart = charts[slotIndex];
    if (!targetChart) return;

    handleUpdateChart(targetChart.id, {
      symbol: ticker.tradingViewSymbol || `BITGET:${ticker.symbol}.P`,
      baseCoin: ticker.baseCoin || ticker.symbol.replace(/USDT$/, '')
    });
  };

  // 1-Click Load Top Gainers to Grid
  const handleLoadTopGainersToGrid = (topTickers) => {
    const slotsCount = LAYOUT_SLOT_COUNTS[layout] || 9;
    setCharts(prev => {
      const updated = [...prev];
      for (let i = 0; i < slotsCount && i < topTickers.length; i++) {
        const t = topTickers[i];
        if (updated[i]) {
          updated[i] = {
            ...updated[i],
            symbol: t.tradingViewSymbol || `BITGET:${t.symbol}.P`,
            baseCoin: t.baseCoin || t.symbol.replace(/USDT$/, '')
          };
        }
      }
      return updated;
    });
  };

  // Select and Load Watchlist
  const handleSelectWatchlist = (watchlistId) => {
    setActiveWatchlistId(watchlistId);
    const wl = watchlists.find(w => w.id === watchlistId);
    if (!wl) return;

    if (wl.isDynamic && wl.id === 'top_gainers_bitget' && tickers.length > 0) {
      const sortedGainers = [...tickers].sort((a, b) => b.change24h - a.change24h);
      handleLoadTopGainersToGrid(sortedGainers);
    } else if (Array.isArray(wl.symbols) && wl.symbols.length > 0) {
      setCharts(prev => {
        const updated = [...prev];
        const slotsCount = LAYOUT_SLOT_COUNTS[layout] || 9;
        for (let i = 0; i < slotsCount && i < wl.symbols.length; i++) {
          const sym = wl.symbols[i].toUpperCase();
          const clean = sym.replace(/USDT$/, '');
          if (updated[i]) {
            updated[i] = {
              ...updated[i],
              symbol: `BITGET:${clean}USDT.P`,
              baseCoin: clean
            };
          }
        }
        return updated;
      });
    }
  };

  // Create Custom Watchlist
  const handleCreateWatchlist = (name, symbols) => {
    const newWl = {
      id: `custom_${Date.now()}`,
      name: `📁 ${name}`,
      isDynamic: false,
      symbols
    };
    setWatchlists(prev => [...prev, newWl]);
    setActiveWatchlistId(newWl.id);
  };

  // Delete Watchlist
  const handleDeleteWatchlist = (id) => {
    setWatchlists(prev => prev.filter(w => w.id !== id));
    if (activeWatchlistId === id) {
      setActiveWatchlistId(watchlists[0]?.id || 'top_gainers_bitget');
    }
  };

  // Import Watchlists from JSON
  const handleImportWatchlists = (importedList) => {
    setWatchlists(importedList);
    alert('Watchlists importate con successo!');
  };

  // Export Watchlists to JSON
  const handleExportWatchlists = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(watchlists, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `bulldash_watchlists_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Open Search Dialog for specific slot
  const handleOpenSearch = (chartId) => {
    const index = charts.findIndex(c => c.id === chartId);
    setSearchModal({
      isOpen: true,
      targetSlotId: chartId,
      targetSlotIndex: index !== -1 ? index : activeSlotIndex
    });
  };

  // Toggle Audio Mute
  const handleToggleMute = () => {
    const muted = soundAlerts.toggleMute();
    setIsMuted(muted);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // If typing in an input, ignore shortcuts
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
        setIsIndicatorsOpen(false);
        setIsWatchlistsOpen(false);
        setSearchModal({ isOpen: false, targetSlotId: null, targetSlotIndex: 0 });
        setMaximizedChartId(null);
      } else if (e.key >= '1' && e.key <= '9') {
        const slot = parseInt(e.key, 10) - 1;
        if (slot < (LAYOUT_SLOT_COUNTS[layout] || 9)) {
          setActiveSlotIndex(slot);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [layout]);

  const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07090e] text-gray-100 overflow-hidden font-sans select-none">
      {/* Top Header Toolbar */}
      <Header
        globalTimeframe={globalTimeframe}
        layout={layout}
        countdowns={countdowns}
        isMuted={isMuted}
        isDrawerOpen={isDrawerOpen}
        isRefreshing={isRefreshing}
        pollingCountdown={pollingCountdown}
        activeWatchlistName={activeWatchlist?.name || 'Watchlist'}
        onSetGlobalTimeframe={handleSetGlobalTimeframe}
        onSetLayout={setLayout}
        onToggleDrawer={() => setIsDrawerOpen(prev => !prev)}
        onToggleMute={handleToggleMute}
        onOpenIndicators={() => setIsIndicatorsOpen(true)}
        onOpenWatchlists={() => setIsWatchlistsOpen(true)}
        onManualRefresh={loadMarketData}
      />

      {/* Main Multi-Chart Grid Viewport */}
      <main className="flex-1 w-full h-full relative overflow-hidden bg-[#06080d]">
        <ChartGrid
          layout={layout}
          charts={charts}
          activeSlotIndex={activeSlotIndex}
          maximizedChartId={maximizedChartId}
          indicatorConfig={indicatorConfig}
          liveTickerData={liveTickerMap}
          binanceMetrics={binanceMetrics}
          onSelectSlot={handleSelectSlot}
          onToggleMaximize={handleToggleMaximize}
          onUpdateChart={handleUpdateChart}
          onOpenSearch={handleOpenSearch}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* Collapsible Left Scanner Drawer */}
        <ScannerDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          tickers={tickers}
          binanceMetrics={binanceMetrics}
          isLoadingMetrics={isLoadingBinanceMetrics}
          onRefreshMetrics={() => {
            const top10Gainers = [...tickers]
              .filter(t => t.usdtVolume >= 1_000_000)
              .sort((a, b) => b.change24h - a.change24h)
              .slice(0, 10)
              .map(t => t.symbol);
            loadBinanceOrderFlow(top10Gainers);
          }}
          activeSlotIndex={activeSlotIndex}
          gridSlotsCount={LAYOUT_SLOT_COUNTS[layout] || 9}
          favorites={favorites}
          onSelectTickerForSlot={(ticker) => handleAssignTickerToSlot(ticker, activeSlotIndex)}
          onLoadTopGainersToGrid={handleLoadTopGainersToGrid}
          onToggleFavorite={handleToggleFavorite}
        />
      </main>

      {/* Modals */}
      <IndicatorsModal
        isOpen={isIndicatorsOpen}
        onClose={() => setIsIndicatorsOpen(false)}
        indicatorConfig={indicatorConfig}
        onApplyIndicators={(newConfig) => setIndicatorConfig(newConfig)}
      />

      <WatchlistModal
        isOpen={isWatchlistsOpen}
        onClose={() => setIsWatchlistsOpen(false)}
        watchlists={watchlists}
        activeWatchlistId={activeWatchlistId}
        onSelectWatchlist={handleSelectWatchlist}
        onCreateWatchlist={handleCreateWatchlist}
        onDeleteWatchlist={handleDeleteWatchlist}
        onImportWatchlists={handleImportWatchlists}
        onExportWatchlists={handleExportWatchlists}
      />

      <SearchModal
        isOpen={searchModal.isOpen}
        onClose={() => setSearchModal({ isOpen: false, targetSlotId: null, targetSlotIndex: 0 })}
        targetSlotId={searchModal.targetSlotId}
        targetSlotIndex={searchModal.targetSlotIndex}
        tickers={tickers}
        onSelectSymbol={(slotId, ticker) => {
          const index = charts.findIndex(c => c.id === slotId);
          handleAssignTickerToSlot(ticker, index !== -1 ? index : activeSlotIndex);
        }}
      />
    </div>
  );
}

export default App;
