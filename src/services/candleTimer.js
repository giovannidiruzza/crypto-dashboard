/**
 * Candle Countdown Timer Service
 * Calculates exact remaining time until candle close for crypto timeframes
 */

const INTERVAL_SECONDS = {
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '30m': 1800,
  '1h': 3600,
  '4h': 14400,
  '12h': 43200,
  '1D': 86400,
};

/**
 * Returns object with countdown info for each interval
 */
export function getCandleCountdowns(now = new Date()) {
  const currentTimestamp = Math.floor(now.getTime() / 1000);

  const results = {};

  for (const [key, seconds] of Object.entries(INTERVAL_SECONDS)) {
    const elapsed = currentTimestamp % seconds;
    const remaining = seconds - elapsed;

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const secs = remaining % 60;

    let formatted = '';
    if (hours > 0) {
      formatted = `${hours}h ${String(minutes).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
    } else if (minutes > 0) {
      formatted = `${minutes}m ${String(secs).padStart(2, '0')}s`;
    } else {
      formatted = `${secs}s`;
    }

    // Near close alert if less than 30s for short intervals or < 60s for long intervals
    const isNearClose = remaining <= (seconds <= 300 ? 20 : 45);

    results[key] = {
      interval: key,
      totalSeconds: seconds,
      remainingSeconds: remaining,
      formatted,
      isNearClose,
      percentElapsed: ((seconds - remaining) / seconds) * 100
    };
  }

  return results;
}

/**
 * Format standard UTC / local time string: HH:MM:SS
 */
export function formatCurrentTime(date = new Date()) {
  return date.toTimeString().split(' ')[0];
}
