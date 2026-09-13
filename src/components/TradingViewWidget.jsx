import React, { useEffect, useRef, memo } from 'react';
import { buildTradingViewStudiesArray } from '../services/tradingViewIndicators';

/**
 * TradingView Widget Component
 * Dynamically mounts and updates TradingView Advanced Real-Time Chart with universal indicators and VWAP bands
 */
const TradingViewWidget = ({
  symbol = 'BITGET:BTCUSDT.P',
  timeframe = '5',
  indicatorConfig = {},
  theme = 'dark',
  containerId
}) => {
  const containerRef = useRef(null);

  // Map application timeframe to TradingView interval string
  const mapInterval = (tf) => {
    switch (tf) {
      case '1m':
      case '1': return '1';
      case '5m':
      case '5': return '5';
      case '15m':
      case '15': return '15';
      case '30m':
      case '30': return '30';
      case '1h':
      case '60': return '60';
      case '4h':
      case '240': return '240';
      case '12h':
      case '720': return '720';
      case '1D':
      case '1d':
      case 'D': return 'D';
      case '1W':
      case '1w':
      case 'W': return 'W';
      case '1M':
      case 'M': return 'M';
      default: return '5';
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let isSubscribed = true;
    let timerId = null;

    // Clear previous widget iframe
    el.innerHTML = '';

    const widgetDivId = `tv_widget_${containerId || Math.random().toString(36).substring(2, 9)}`;
    const widgetContainer = document.createElement('div');
    widgetContainer.id = widgetDivId;
    widgetContainer.style.width = '100%';
    widgetContainer.style.height = '100%';
    el.appendChild(widgetContainer);

    widgetContainer.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#64748b;font-size:12px;font-family:monospace;">
        Caricamento Grafico Bitget (${symbol})...
      </div>
    `;

    const initWidget = () => {
      if (!isSubscribed || !containerRef.current) return;
      
      try {
        // Clear loading placeholder
        widgetContainer.innerHTML = '';

        // Build studies array from activeIndicatorIds or fallback
        let studies = [];
        if (Array.isArray(indicatorConfig?.activeIndicatorIds)) {
          studies = buildTradingViewStudiesArray(
            indicatorConfig.activeIndicatorIds, 
            indicatorConfig.customInputs
          );
        } else {
          // Backward compatibility
          const legacyIds = [];
          if (indicatorConfig?.ema20?.enabled) legacyIds.push('ema20');
          if (indicatorConfig?.ema50?.enabled) legacyIds.push('ema50');
          if (indicatorConfig?.ema100?.enabled) legacyIds.push('ema100');
          if (indicatorConfig?.ema200?.enabled) legacyIds.push('ema200');
          if (indicatorConfig?.vwap?.enabled) legacyIds.push('vwap');
          if (indicatorConfig?.atr?.enabled) legacyIds.push('atr');
          if (indicatorConfig?.volume?.enabled) legacyIds.push('volume');
          if (indicatorConfig?.bollingerBands?.enabled) legacyIds.push('bollinger_bands');
          if (indicatorConfig?.rsi?.enabled) legacyIds.push('rsi');
          if (indicatorConfig?.macd?.enabled) legacyIds.push('macd');
          studies = buildTradingViewStudiesArray(legacyIds);
        }

        const showTvHeader = !!indicatorConfig?.showTvHeader;

        const disabledFeatures = [
          'use_localstorage_for_settings',
          'header_symbol_search',
          'header_resolutions',
          'header_chart_type',
          'header_compare',
          'header_undo_redo',
          'header_screenshot',
          'header_fullscreen_button'
        ];

        if (!showTvHeader) {
          disabledFeatures.push('header_widget', 'header_settings', 'header_indicators');
        }

        new window.TradingView.widget({
          container_id: widgetDivId,
          autosize: true,
          symbol: symbol,
          interval: mapInterval(timeframe),
          timezone: 'exchange',
          theme: theme,
          style: '1', // Japanese Candlesticks
          locale: 'it',
          toolbar_bg: '#080b11',
          enable_publishing: false,
          hide_top_toolbar: !showTvHeader,
          hide_legend: false,
          save_image: false,
          studies: studies,
          disabled_features: disabledFeatures,
          enabled_features: showTvHeader ? ['header_indicators', 'header_settings'] : ['hide_left_toolbar_by_default'],
          studies_overrides: {
            'volume weighted average price.showBands': true,
            'volume weighted average price.bandsMultiplier1': 1,
            'volume weighted average price.bandsMultiplier2': 2,
            'volume weighted average price.bandsMultiplier3': 3,
            'volume weighted average price.plot.color': '#2563eb', // Blue central VWAP
            'volume weighted average price.plot.linewidth': 2,
            'volume weighted average price.upper band #1.visible': true,
            'volume weighted average price.lower band #1.visible': true,
            'volume weighted average price.upper band #2.visible': true,
            'volume weighted average price.lower band #2.visible': true,
            'volume weighted average price.upper band #3.visible': true,
            'volume weighted average price.lower band #3.visible': true,
            'volume weighted average price.upper band #1.color': '#38bdf8',
            'volume weighted average price.lower band #1.color': '#38bdf8',
            'volume weighted average price.upper band #2.color': '#fbbf24',
            'volume weighted average price.lower band #2.color': '#fbbf24',
            'volume weighted average price.upper band #3.color': '#ef4444', // Red upper band
            'volume weighted average price.lower band #3.color': '#10b981', // Green lower band
            'volume weighted average price.upper band #1.linewidth': 1,
            'volume weighted average price.lower band #1.linewidth': 1,
            'volume weighted average price.upper band #2.linewidth': 1,
            'volume weighted average price.lower band #2.linewidth': 1,
            'volume weighted average price.upper band #3.linewidth': 2,
            'volume weighted average price.lower band #3.linewidth': 2,
            'vwap.showBands': true,
            'vwap.bandsMultiplier1': 1,
            'vwap.bandsMultiplier2': 2,
            'vwap.bandsMultiplier3': 3,
            'vwap.plot.color': '#2563eb',
            'vwap.plot.linewidth': 2,
            'vwap.upper band #1.visible': true,
            'vwap.lower band #1.visible': true,
            'vwap.upper band #2.visible': true,
            'vwap.lower band #2.visible': true,
            'vwap.upper band #3.visible': true,
            'vwap.lower band #3.visible': true,
            'vwap.upper band #1.color': '#38bdf8',
            'vwap.lower band #1.color': '#38bdf8',
            'vwap.upper band #2.color': '#fbbf24',
            'vwap.lower band #2.color': '#fbbf24',
            'vwap.upper band #3.color': '#ef4444',
            'vwap.lower band #3.color': '#10b981',
            'vwap.upper band #1.linewidth': 1,
            'vwap.lower band #1.linewidth': 1,
            'vwap.upper band #2.linewidth': 1,
            'vwap.lower band #2.linewidth': 1,
            'vwap.upper band #3.linewidth': 2,
            'vwap.lower band #3.linewidth': 2
          },
          overrides: {
            'mainSeriesProperties.candleStyle.upColor': '#00e676',
            'mainSeriesProperties.candleStyle.downColor': '#ff3366',
            'mainSeriesProperties.candleStyle.drawWick': true,
            'mainSeriesProperties.candleStyle.drawBorder': true,
            'mainSeriesProperties.candleStyle.borderColor': '#374151',
            'mainSeriesProperties.candleStyle.borderUpColor': '#00e676',
            'mainSeriesProperties.candleStyle.borderDownColor': '#ff3366',
            'mainSeriesProperties.candleStyle.wickUpColor': '#00e676',
            'mainSeriesProperties.candleStyle.wickDownColor': '#ff3366',
            'paneProperties.background': '#080b11',
            'paneProperties.vertGridProperties.color': 'rgba(255, 255, 255, 0.03)',
            'paneProperties.horzGridProperties.color': 'rgba(255, 255, 255, 0.03)',
            'scalesProperties.textColor': '#64748b',
            'scalesProperties.lineColor': 'rgba(255, 255, 255, 0.08)'
          }
        });
      } catch (err) {
        console.error('TradingView Widget initialization error:', err);
      }
    };

    if (window.TradingView && window.TradingView.widget) {
      initWidget();
    } else {
      let attempts = 0;
      timerId = setInterval(() => {
        attempts++;
        if (window.TradingView && window.TradingView.widget) {
          clearInterval(timerId);
          initWidget();
        } else if (attempts > 50) { // after 5 seconds
          clearInterval(timerId);
          widgetContainer.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#ef4444;font-size:12px;font-family:sans-serif;padding:8px;text-align:center;">
              <div>Impossibile caricare TradingView</div>
              <div style="font-size:10px;color:#94a3b8;margin-top:4px;">Verifica la connessione internet</div>
            </div>
          `;
        }
      }, 100);
    }

    return () => {
      isSubscribed = false;
      if (timerId) clearInterval(timerId);
      if (el) el.innerHTML = '';
    };
  }, [symbol, timeframe, JSON.stringify(indicatorConfig), theme]);

  return (
    <div 
      ref={containerRef} 
      className="chart-container-wrapper w-full h-full relative overflow-hidden bg-[#06080d]"
    />
  );
};

export default memo(TradingViewWidget);
