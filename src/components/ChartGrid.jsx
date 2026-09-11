import React from 'react';
import ChartCard from './ChartCard';

const LAYOUT_COUNTS = {
  '1x1': 1,
  '2x2': 4,
  '3x2': 6,
  '3x3': 9,
  '4x3': 12,
  '4x4': 16
};

const ChartGrid = ({
  layout = '3x3',
  charts = [],
  activeSlotIndex = 0,
  maximizedChartId = null,
  indicatorConfig = {},
  liveTickerData = {},
  onSelectSlot,
  onToggleMaximize,
  onUpdateChart,
  onOpenSearch,
  onToggleFavorite
}) => {
  const visibleCount = LAYOUT_COUNTS[layout] || 9;
  const visibleCharts = charts.slice(0, visibleCount);

  // If a single chart is maximized
  if (maximizedChartId) {
    const maximizedChart = charts.find(c => c.id === maximizedChartId) || charts[0];
    const index = charts.findIndex(c => c.id === maximizedChartId);

    return (
      <div className="w-full h-full p-1 bg-[#06080d]">
        <ChartCard
          chart={maximizedChart}
          index={index !== -1 ? index : 0}
          indicatorConfig={indicatorConfig}
          liveTickerData={liveTickerData}
          isActiveSlot={true}
          isMaximized={true}
          onSelectSlot={() => {}}
          onToggleMaximize={onToggleMaximize}
          onUpdateChart={onUpdateChart}
          onOpenSearch={onOpenSearch}
          onToggleFavorite={onToggleFavorite}
        />
      </div>
    );
  }

  return (
    <div className={`w-full h-full p-1.5 chart-grid-${layout}`}>
      {visibleCharts.map((chart, index) => (
        <ChartCard
          key={chart.id}
          chart={chart}
          index={index}
          indicatorConfig={indicatorConfig}
          liveTickerData={liveTickerData}
          isActiveSlot={index === activeSlotIndex}
          isMaximized={false}
          onSelectSlot={onSelectSlot}
          onToggleMaximize={onToggleMaximize}
          onUpdateChart={onUpdateChart}
          onOpenSearch={onOpenSearch}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};

export default ChartGrid;
