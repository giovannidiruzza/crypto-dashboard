/**
 * Web Audio API Sound Chime Service
 * Synthesizes subtle audio alerts without external audio files
 */

class SoundAlertService {
  constructor() {
    this.audioCtx = null;
    this.isMuted = true; // Default muted per ADR 0005
    this.lastTriggeredTime = {};
  }

  init() {
    if (!this.audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (!muted && !this.audioCtx) {
      this.init();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended' && !muted) {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Play a clean two-tone digital chime on candle close
   */
  playCandleCloseChime(timeframe = '5m') {
    if (this.isMuted) return;

    try {
      this.init();
      if (!this.audioCtx) return;

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      // Note 1 (A5: 880Hz)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.exponentialRampToValueAtTime(0.15, now + 0.03);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);

      osc1.start(now);
      osc1.stop(now + 0.26);

      // Note 2 (D6: 1174Hz)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1174.66, now + 0.12);
      gain2.gain.setValueAtTime(0.001, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.18, now + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);

      osc2.start(now + 0.12);
      osc2.stop(now + 0.56);
    } catch (e) {
      console.warn('Web Audio playback error:', e);
    }
  }

  /**
   * Check remaining seconds and trigger alert when entering close window
   */
  checkAndTriggerAlert(countdownData) {
    if (this.isMuted || !countdownData) return;

    const currentMinuteTimestamp = Math.floor(Date.now() / 60000);

    // Track intervals like 5m and 15m
    ['5m', '15m'].forEach(tf => {
      const info = countdownData[tf];
      if (info && info.remainingSeconds === 1) {
        const key = `${tf}_${currentMinuteTimestamp}`;
        if (!this.lastTriggeredTime[key]) {
          this.lastTriggeredTime[key] = true;
          this.playCandleCloseChime(tf);
        }
      }
    });
  }
}

export const soundAlerts = new SoundAlertService();
export default soundAlerts;
